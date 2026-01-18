import Image from "next/image"

interface CategoryIconProps {
  categoryId: string
  categoryName: string
  size?: number
}

export function CategoryIcon({ categoryId, categoryName, size = 24 }: CategoryIconProps) {
  return (
    <Image
      src={`/images/categories/${categoryId}.webp`}
      alt={categoryName}
      width={size}
      height={size}
    />
  )
}
