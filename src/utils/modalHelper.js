import Swal from "sweetalert2";

/**
 * Muestra un modal con estilos personalizados usados en la ruleta.
 *
 * @param {Object} options
 * @param {string} options.title              Título del modal.
 * @param {string} [options.html]             Contenido HTML del modal.
 * @param {string} [options.iconSrc]          Ruta de la imagen a usar como icono.
 * @param {string} [options.confirmButtonText]Texto del botón de confirmar.
 * @param {boolean} [options.showCloseButton]Si se muestra el botón de cerrar (X).
 * @param {Function} [options.onConfirm]      Callback que se ejecuta cuando el usuario confirma.
 * @param {Object} [options.fireOptions]      Opciones adicionales para Swal.fire.
 *
 * @returns {Promise<import('sweetalert2').SweetAlertResult<any>>}
 */
export function showCustomModal({
  title,
  html = "",
  iconSrc,
  confirmButtonText = "Entendido",
  showCloseButton = true,
  onConfirm,
  fireOptions = {},
} = {}) {
  const swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      popup: "rounded-[20px] max-w-[640px] w-full pb-8 lg:p-4 lg:pb-8",
      actions: "gap-2",
      icon: "rounded-[0px] border-0",
      title:
        "font-amx-bold text-2xl xl:text-3xl text-black pt-0 text-balance px-2",
      htmlContainer:
        "font-roboto text-base text-black !flex flex-col gap-2 xl:gap-3 px-10 pt-2",
      cancelButton: "",
      confirmButton:
        "font-amx-bold min-w-[124px] max-w-fit cursor-pointer outline-none py-3 px-6 font-medium text-base rounded-[40px] transition duration-300 flex items-center justify-center gap-1 leading-none h-fit bg-claro hover:bg-claro-dark text-white",
    },
    buttonsStyling: false,
  });

  const baseOptions = {
    title,
    html,
    showCancelButton: false,
    showConfirmButton: true,
    confirmButtonText,
    cancelButtonText: "",
    reverseButtons: false,
    showCloseButton,
  };

  if (iconSrc) {
    baseOptions.iconHtml = `<img src='${iconSrc}' />`;
  }

  return swalWithBootstrapButtons.fire({
    ...baseOptions,
    ...fireOptions,
  }).then((result) => {
    // console.log(result);
    if (
      typeof onConfirm === "function" &&
      (result.isConfirmed ||
        (result.isDismissed &&
          result.dismiss === Swal.DismissReason.backdrop))
    ) {
      onConfirm(result);
    }
    return result;
  });
}
