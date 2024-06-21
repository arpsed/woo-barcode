export default () => {
	let scrollWidth = 0,
		modals = [],
		zIndex = 1273;

	const d = document,
		w = window,
		$b = d.querySelector( 'body' ),

		init = () => {
			scrollWidth = w.innerWidth - d.documentElement.clientWidth;

			addEventListeners();
		},

		addEventListeners = () => {
			$b.addEventListener( 'click', function ( e ) {
				if ( e.target.matches( '.bwo-modal-open' ) || e.target.closest( '.bwo-modal-open' ) ) {
					e.preventDefault();

					const origin = e.target.matches( '.bwo-modal-open' ) ? e.target : e.target.closest( '.bwo-modal-open' ),
						target = d.querySelector( origin.getAttribute( 'href' ) || origin.dataset.target );

					handlerOpen( target, origin );
				}

				if ( e.target.matches( '.bwo-modal-close' ) || e.target.closest( '.bwo-modal-close' )  ) {
					e.preventDefault();

					const origin = e.target.matches( '.bwo-modal-close' ) ? e.target : e.target.closest( '.bwo-modal-close' ),
						modalId = parseInt( origin.closest( '[data-modal-id]' ).dataset.modalId );

					handlerClose( modalId );
				}
			}, false );

			d.addEventListener( 'bwoModalOpen', function ( e ) {
				if ( e.detail.modalTarget ) {
					handlerOpen( document.getElementById( e.detail.modalTarget ), {});
				}
			}, false );

			d.addEventListener( 'bwoModalClose', function ( e ) {
				if ( e.detail.modalTarget ) {
					handlerClose( parseInt( document.getElementById( e.detail.modalTarget ).dataset.modalId ) );
				}
			}, false );

			w.addEventListener( 'resize', resizeHandler );
		},

		handlerOpen = ( $popup, origin ) => {
			modals.push( $popup );
			$popup.setAttribute( 'data-modal-id', modals.length - 1 );
			$popup.style.display = 'block';
			$popup.style.zIndex = zIndex + ( modals.length - 1 );

			if ( ! $b.classList.contains( 'body-modal' ) ) {
				$b.classList.add( 'body-modal' );

				$b.style.paddingRight = scrollWidth;
			}

			setTimeout( () => {
				const data = origin.dataset ? origin.dataset : null;

				$popup.classList.add( 'show' );
				$popup.dispatchEvent(
					new CustomEvent( 'bwoModalOpened', { detail: data }),
				);
			}, 150 );
		},

		handlerClose = modalId => {
			modals[modalId].classList.remove( 'show' );
			modals[modalId].removeAttribute( 'data-modal-id' );

			modals[modalId].style.display = '';
			modals[modalId].style.zIndex = '';

			if ( modals.length === 1 ) {
				$b.classList.remove( 'body-modal' );

				$b.style.paddingRight = '';
			}

			modals[modalId].dispatchEvent( new Event( 'bwoModalClosed' ) );
			modals.splice( modalId, 1 );
		},

		resizeHandler = () => {
			scrollWidth = w.innerWidth - d.documentElement.clientWidth;
		};

	init();
};
