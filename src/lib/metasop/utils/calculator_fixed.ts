export class Calculator {
  private history: string[] = [];

  add(a: number, b: number): number {
    const result = a + b;
    this.history.push('add(' + a + ', ' + b + ') = ' + result);
    return result;
  }

  subtract(a: number, b: number): number {
    const result = a - b;
    this.history.push('subtract(' + a + ', ' + b + ') = ' + result);
    return result;
  }

  multiply(a: number, b: number): number {
    const result = a * b;
    this.history.push('multiply(' + a + ', ' + b + ') = ' + result);
    return result;
  }

  divide(a: number, b: number): number {
    if (b === 0) {
      throw new Error('Cannot divide by zero');
    }
    const result = a / b;
    this.history.push('divide(' + a + ', ' + b + ') = ' + result);
    return result;
  }

  getHistory(): string[] {
    return [...this.history];
  }

  clearHistory(): void {
    this.history = [];
  }
}
