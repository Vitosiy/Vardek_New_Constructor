export const UI_PARAMS = {
    TOTAL_LENGTH: 3000, // Общая длина в миллиметрах
    TOTAL_HEIGHT: 1200, // Общая высота в миллиметрах
    MAX_AREA_WIDTH: 800, // Максимальная ширина области в пикселях
    MIN_SECTION_WIDTH: 150, // Минимальная ширина секции
    MIN_SECTION_HEIGHT: 150, // Минимальная высота секции
    MIN_HOLE_SIZE_MM: 100, // Минимальный размер отверстия в мм
    MAX_HOLE_SIZE_MM: 1000, // Максимальный размер отверстия в мм,
    BACKGROUND_COLOR: "#FFFFFF",
    HOLE_OFFSET: 10,// Отступ от краёв
    SECTOR_PADDING: 30
}

export const SERVISE_ERRORS: Record<string, string> = {
    '101': 'Пересечение распилов',
}

export const EN_RU_NAME = {
    height: "Высота",
    width: "Ширина",
    depth: "Глубина",
}