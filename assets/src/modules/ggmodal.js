export default () => {
	let scrollWidth = 0,
		modals = [];

	const $ = jQuery,
		d = document,
		w = window,
		$b = $( 'body' ),

		init = () => {
			scrollWidth = w.innerWidth - d.documentElement.clientWidth;

			addEventListeners();
		},

		addEventListeners = () => {
			$b.on( 'open', '.bwo-modal', modalOpenHandler );
			$b.on( 'close', '.bwo-modal', modalCloseHandler );
			$b.on( 'click', '.bwo-modal-open', clickOpenHandler );
			$b.on( 'click', '.bwo-modal-close', clickCloseHandler );
			$( w ).on( 'resize', resizeHandler );
		},

		handlerOpen = ( $this, event ) => {
			modals.push( $this );
			$this.attr( 'data-modal-id', modals.length - 1 );
			$this.css( 'display', 'block' );

			if ( ! $b.hasClass( 'body-modal' ) ) {
				$b.addClass( 'body-modal' ).css( 'padding-right', scrollWidth );
			}

			setTimeout( () => {
				const $origin = $( event.currentTarget );

				$this.addClass( 'show' );
				$this.trigger( 'bwoModalOpened', {
					...{ origin: $origin },
					...$origin.data(),
				});
			}, 150 );
		},

		modalOpenHandler = function ( e ) {
			handlerOpen( $( this ), e );
		},

		clickOpenHandler = e => {
			e.preventDefault();

			const target = e.currentTarget.getAttribute( 'href' ) || e.currentTarget.getAttribute( 'data-target' );

			let $this = $( target );

			if ( $this.length === 0 ) {
				$this = getModalTpl();

				$this.attr( 'id', target.substr( 1 ) ).appendTo( $b );
			}

			handlerOpen( $this, e );
		},

		handlerClose = modalID => {
			modals[modalID].removeClass( 'show' ).css( 'display', '' ).removeAttr( 'data-modal-id' );
			modals[modalID].trigger( 'bwoModalClosed' );

			if ( modals.length === 1 ) {
				$b.removeClass( 'body-modal' ).css( 'padding-right', '' );
			}

			modals.splice( modalID, 1 );
		},

		modalCloseHandler = function () {
			handlerClose( $( this ).data( 'modal-id' ) );
		},

		clickCloseHandler = e => {
			e.preventDefault();

			const modalID = parseInt( $( e.target ).parents( '[data-modal-id]' ).data( 'modal-id' ) );

			handlerClose( modalID );
		},

		resizeHandler = () => {
			scrollWidth = w.innerWidth - d.documentElement.clientWidth;
		},

		getModalTpl = () => {
			return $( $( '#bwoModalTemplate' ).html() ).clone();
		};

	init();
};
