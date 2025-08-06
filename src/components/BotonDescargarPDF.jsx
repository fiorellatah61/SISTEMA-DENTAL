// // components/BotonDescargarPDF.jsx
// import { useState } from 'react';
// import { Download, FileText, Loader2 } from 'lucide-react';

// const BotonDescargarPDF = ({ 
//   fichaId, 
//   numeroFicha, 
//   className = "", 
//   variant = "primary" 
// }) => {
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [error, setError] = useState(null);

//   const handleDownloadPDF = async () => {
//     if (!fichaId) {
//       setError('ID de ficha no válido');
//       return;
//     }

//     setIsGenerating(true);
//     setError(null);

//     try {
//       // Llamar a la API para generar el PDF
//       const response = await fetch(`/api/generate-pdf/${fichaId}`, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });

//       if (!response.ok) {
//         throw new Error(`Error ${response.status}: ${response.statusText}`);
//       }

//       // Crear blob del PDF
//       const pdfBlob = await response.blob();
//       const pdfUrl = URL.createObjectURL(pdfBlob);

//       // Abrir en nueva pestaña para visualizar
//       const newWindow = window.open(pdfUrl, '_blank');
      
//       if (newWindow) {
//         // Opcional: Limpiar la URL después de un tiempo
//         setTimeout(() => {
//           URL.revokeObjectURL(pdfUrl);
//         }, 10000);
//       } else {
//         // Si no se puede abrir nueva ventana, descargar directamente
//         const link = document.createElement('a');
//         link.href = pdfUrl;
//         link.download = `ficha-odontologica-${numeroFicha || fichaId}.pdf`;
//         document.body.appendChild(link);
//         link.click();
//         document.body.removeChild(link);
//         URL.revokeObjectURL(pdfUrl);
//       }

//     } catch (error) {
//       console.error('Error al generar PDF:', error);
//       setError('Error al generar PDF. Inténtalo de nuevo.');
//     } finally {
//       setIsGenerating(false);
//     }
//   };

//   const getButtonStyles = () => {
//     const baseStyles = `
//       inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg
//       font-medium transition-all duration-200 focus:outline-none focus:ring-2
//       focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed
//     `;

//     const variants = {
//       primary: `
//         bg-green-600 hover:bg-green-700 text-white 
//         focus:ring-green-500 shadow-md hover:shadow-lg
//       `,
//       secondary: `
//         bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300
//         focus:ring-gray-500
//       `,
//       outline: `
//         border-2 border-green-600 text-green-600 hover:bg-green-50
//         focus:ring-green-500
//       `,
//       minimal: `
//         text-green-600 hover:text-green-700 hover:bg-green-50 
//         focus:ring-green-500
//       `
//     };

//     return `${baseStyles} ${variants[variant]} ${className}`;
//   };

//   return (
//     <div className="relative">
//       <button
//         onClick={handleDownloadPDF}
//         disabled={isGenerating}
//         className={getButtonStyles()}
//         title={`Descargar PDF de la ficha ${numeroFicha || fichaId}`}
//       >
//         {isGenerating ? (
//           <>
//             <Loader2 className="h-4 w-4 animate-spin" />
//             Generando PDF...
//           </>
//         ) : (
//           <>
//             <FileText className="h-4 w-4" />
//             Descargar PDF
//           </>
//         )}
//       </button>

//       {error && (
//         <div className="absolute top-full left-0 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm min-w-max z-10">
//           <div className="flex items-center gap-2">
//             <span className="text-red-500">⚠️</span>
//             {error}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default BotonDescargarPDF;

// components/BotonDescargarPDF.jsx
import { useState } from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';

const BotonDescargarPDF = ({ 
  fichaId, 
  numeroFicha, 
  className = "", 
  variant = "primary" 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const handleDownloadPDF = async () => {
    console.log('=== DEBUG DESCARGA PDF ===');
    console.log('fichaId recibido:', fichaId);
    console.log('numeroFicha recibido:', numeroFicha);
    console.log('tipo de fichaId:', typeof fichaId);
    
    if (!fichaId) {
      console.error('fichaId está vacío o undefined');
      setError('ID de ficha no válido');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const url = `/api/generate-pdf/${fichaId}`;
      console.log('URL de la API:', url);
      
      // Llamar a la API para generar el PDF
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      // Crear blob del PDF
      const pdfBlob = await response.blob();
      console.log('PDF blob size:', pdfBlob.size);
      
      const pdfUrl = URL.createObjectURL(pdfBlob);

      // Abrir en nueva pestaña para visualizar
      const newWindow = window.open(pdfUrl, '_blank');
      
      if (newWindow) {
        // Opcional: Limpiar la URL después de un tiempo
        setTimeout(() => {
          URL.revokeObjectURL(pdfUrl);
        }, 10000);
      } else {
        // Si no se puede abrir nueva ventana, descargar directamente
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `ficha-odontologica-${numeroFicha || fichaId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(pdfUrl);
      }

    } catch (error) {
      console.error('Error completo al generar PDF:', error);
      setError('Error al generar PDF. Inténtalo de nuevo.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getButtonStyles = () => {
    const baseStyles = `
      inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg
      font-medium transition-all duration-200 focus:outline-none focus:ring-2
      focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed
    `;

    const variants = {
      primary: `
        bg-green-600 hover:bg-green-700 text-white 
        focus:ring-green-500 shadow-md hover:shadow-lg
      `,
      secondary: `
        bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300
        focus:ring-gray-500
      `,
      outline: `
        border-2 border-green-600 text-green-600 hover:bg-green-50
        focus:ring-green-500
      `,
      minimal: `
        text-green-600 hover:text-green-700 hover:bg-green-50 
        focus:ring-green-500
      `
    };

    return `${baseStyles} ${variants[variant]} ${className}`;
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleDownloadPDF}
        disabled={isGenerating || !fichaId}
        className={getButtonStyles()}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generando PDF...
          </>
        ) : (
          <>
            <FileText className="w-4 h-4" />
            Descargar PDF
          </>
        )}
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="flex items-center">
            <span className="text-red-600 mr-2">⚠️</span>
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        </div>
      )}
      
      {/* Debug info - solo en desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-100 p-2 rounded text-xs">
          <strong>Debug:</strong><br/>
          fichaId: {fichaId || 'undefined'}<br/>
          numeroFicha: {numeroFicha || 'undefined'}
        </div>
      )}
    </div>
  );
};

export default BotonDescargarPDF;