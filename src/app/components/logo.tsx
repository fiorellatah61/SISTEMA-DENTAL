import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  width?: number
  height?: number
  className?: string
  showText?: boolean
  linkTo?: string
}

export default function Logo({ 
  width = 120, 
  height = 40, 
  className = '', 
  showText = true,
  linkTo = '/'
}: LogoProps) {
  const logoContent = (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/Logo.png" // Asegúrate de que tu logo.png esté en la carpeta public/
        alt="Logo"
        width={width}
        height={height}
        priority // Para cargar más rápido
        className="object-contain"
      />
      {showText && (
        <span className="ml-2 text-xl font-bold text-gray-800">
          Sistema de Gestion Odontologica
        </span>
      )}
    </div>
  )

  // // Si se especifica un link, envolver en Link
  // if (linkTo) {
  //   return (
  //     <Link href={linkTo} className="cursor-pointer">
  //       {logoContent}
  //     </Link>
  //   )
  // }

  return logoContent
}