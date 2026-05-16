interface Math {
    idiv(x: number, y: number): number
}

interface Array<T> {
    insertAt(index: number, value: T): void
    removeAt(index: number): T
}

interface Screen {
    (): Bitmap
}
