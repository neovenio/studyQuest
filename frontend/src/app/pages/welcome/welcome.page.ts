import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-welcome-page',
  imports: [RouterLink],
  templateUrl: './welcome.page.html',
  styleUrl: './welcome.page.scss',
})
export class WelcomePageComponent implements AfterViewInit {
  @ViewChild('pencilCanvas')
  private pencilCanvas?: ElementRef<HTMLCanvasElement>;

  async ngAfterViewInit(): Promise<void> {
    const canvas = this.pencilCanvas?.nativeElement;

    if (!canvas) {
      return;
    }

    try {
      const image = await this.loadImage('/assets/pencil-reference.jpg');
      this.renderPencil(canvas, image);
    } catch {
      // Leave the decorative slot empty if the asset fails to load.
    }
  }

  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();

      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`Could not load image: ${src}`));
      image.src = src;
    });
  }

  private renderPencil(canvas: HTMLCanvasElement, image: HTMLImageElement): void {
    const width = image.naturalWidth || image.width;
    const height = image.naturalHeight || image.height;
    const context = canvas.getContext('2d');

    if (!width || !height || !context) {
      return;
    }

    canvas.width = width;
    canvas.height = height;
    context.clearRect(0, 0, width, height);
    context.imageSmoothingEnabled = false;

    context.save();
    context.scale(-1, 1);
    context.drawImage(image, -width, 0, width, height);
    context.restore();

    const imageData = context.getImageData(0, 0, width, height);
    this.removeBackground(imageData, width, height);
    this.cleanBackgroundHalo(imageData, width, height);
    context.putImageData(imageData, 0, 0);
  }

  private removeBackground(imageData: ImageData, width: number, height: number): void {
    const data = imageData.data;
    const visited = new Uint8Array(width * height);
    const background = this.sampleBackgroundColor(data, width, height);
    const queue: number[] = [];

    for (let x = 0; x < width; x += 1) {
      this.enqueueIfBackground(queue, visited, data, width, height, x, 0, background);
      this.enqueueIfBackground(queue, visited, data, width, height, x, height - 1, background);
    }

    for (let y = 0; y < height; y += 1) {
      this.enqueueIfBackground(queue, visited, data, width, height, 0, y, background);
      this.enqueueIfBackground(queue, visited, data, width, height, width - 1, y, background);
    }

    while (queue.length > 0) {
      const index = queue.pop()!;
      const x = index % width;
      const y = Math.floor(index / width);
      const pixelIndex = index * 4;

      data[pixelIndex + 3] = 0;

      this.enqueueIfBackground(queue, visited, data, width, height, x - 1, y, background);
      this.enqueueIfBackground(queue, visited, data, width, height, x + 1, y, background);
      this.enqueueIfBackground(queue, visited, data, width, height, x, y - 1, background);
      this.enqueueIfBackground(queue, visited, data, width, height, x, y + 1, background);
    }
  }

  private enqueueIfBackground(
    queue: number[],
    visited: Uint8Array,
    data: Uint8ClampedArray,
    width: number,
    height: number,
    x: number,
    y: number,
    background: [number, number, number],
  ): void {
    if (x < 0 || y < 0 || x >= width || y >= height) {
      return;
    }

    const index = y * width + x;

    if (visited[index]) {
      return;
    }

    visited[index] = 1;

    const pixelIndex = index * 4;
    const alpha = data[pixelIndex + 3];

    if (alpha === 0) {
      queue.push(index);
      return;
    }

    const red = data[pixelIndex];
    const green = data[pixelIndex + 1];
    const blue = data[pixelIndex + 2];

    if (this.isNearBackground(red, green, blue, background)) {
      queue.push(index);
    }
  }

  private sampleBackgroundColor(
    data: Uint8ClampedArray,
    width: number,
    height: number,
  ): [number, number, number] {
    const corners: Array<[number, number]> = [
      [0, 0],
      [width - 1, 0],
      [0, height - 1],
      [width - 1, height - 1],
      [1, 1],
      [width - 2, 1],
      [1, height - 2],
      [width - 2, height - 2],
    ];

    let redTotal = 0;
    let greenTotal = 0;
    let blueTotal = 0;

    for (const [x, y] of corners) {
      const index = (y * width + x) * 4;
      redTotal += data[index];
      greenTotal += data[index + 1];
      blueTotal += data[index + 2];
    }

    const count = corners.length;

    return [
      Math.round(redTotal / count),
      Math.round(greenTotal / count),
      Math.round(blueTotal / count),
    ];
  }

  private isNearBackground(
    red: number,
    green: number,
    blue: number,
    background: [number, number, number],
  ): boolean {
    const [bgRed, bgGreen, bgBlue] = background;
    const distance = Math.abs(red - bgRed) + Math.abs(green - bgGreen) + Math.abs(blue - bgBlue);

    return distance <= 70;
  }

  private cleanBackgroundHalo(imageData: ImageData, width: number, height: number): void {
    const data = imageData.data;
    const background = this.sampleBackgroundColor(data, width, height);

    for (let y = 1; y < height - 1; y += 1) {
      for (let x = 1; x < width - 1; x += 1) {
        const index = (y * width + x) * 4;
        const alpha = data[index + 3];

        if (alpha === 0 || !this.hasTransparentNeighbor(data, width, height, x, y)) {
          continue;
        }

        const distance = this.colorDistance(
          data[index],
          data[index + 1],
          data[index + 2],
          background,
        );

        if (distance <= 42) {
          data[index + 3] = 0;
          continue;
        }

        if (distance <= 96) {
          const ratio = (distance - 42) / (96 - 42);
          data[index + 3] = Math.round(alpha * ratio);
        }
      }
    }
  }

  private hasTransparentNeighbor(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    x: number,
    y: number,
  ): boolean {
    for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
      for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
        if (offsetX === 0 && offsetY === 0) {
          continue;
        }

        const neighborX = x + offsetX;
        const neighborY = y + offsetY;

        if (neighborX < 0 || neighborY < 0 || neighborX >= width || neighborY >= height) {
          continue;
        }

        const neighborIndex = (neighborY * width + neighborX) * 4;

        if (data[neighborIndex + 3] === 0) {
          return true;
        }
      }
    }

    return false;
  }

  private colorDistance(
    red: number,
    green: number,
    blue: number,
    background: [number, number, number],
  ): number {
    const [bgRed, bgGreen, bgBlue] = background;

    return Math.abs(red - bgRed) + Math.abs(green - bgGreen) + Math.abs(blue - bgBlue);
  }
}
