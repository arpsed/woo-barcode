/* global ggbwo */

import ggModal from './modules/ggmodal';
import JsBarcode from 'jsbarcode';
import domtoimage from 'dom-to-image';
import printJS from 'print-js';

document.addEventListener( 'DOMContentLoaded', function () {
	ggModal();

	const $ = jQuery,
		orderBarcode = document.getElementById( 'bwoOrderBarcode' ),
		scannerLink = document.querySelector( '.bwo-barcode-scanner .ab-item' );

	if ( orderBarcode ) {
		const orderId = orderBarcode.dataset.id;

		JsBarcode( `#${orderBarcode.id}`, orderId, { width: 3 });
		document.getElementById( 'bwoBarcodeDl' ).addEventListener( 'click', function () {
			domtoimage.toPng( orderBarcode )
				.then( dataUrl => {
					const link = document.createElement( 'a' );
					link.download = `barcode-${orderId}.png`;
					link.href = dataUrl;
					link.click();
				})
				.catch( error => {
					console.error( 'oops, something went wrong!', error ); // eslint-disable-line no-console
				});
		});
		document.getElementById( 'bwoBarcodePr' ).addEventListener( 'click', function () {
			printJS( orderBarcode.id, 'html' );
		});
	}

	if ( scannerLink ) {
		scannerLink.classList.add( 'gg-modal-open' );

		const $body = document.querySelector( '#bwoBarcodeScanner .gg-modal-body' ),
			$form = $body.querySelector( 'form' ),
			$message = $body.querySelector( '.bwo-scanner-message' ),
			$result = $body.querySelector( '.bwo-scanner-result' );

		$form.addEventListener( 'submit', function ( e ) {
			e.preventDefault();

			const orderId = $form.querySelector( '[type="text"]' ).value.trim().replace( /\D/g, '' ),
				$submit = $form.querySelector( '[type="submit"]' ),
				fetchURL = new URL( ggbwo.ajaxurl );

			fetchURL.searchParams.append( 'action', 'ggbwo_get_order' );
			fetchURL.searchParams.append( 'orderId', orderId );
			fetchURL.searchParams.append( 'nonce', ggbwo.nonces.scanner );
			$submit.textContent = ggbwo.texts.labelSrchin;
			clearElms( false );
			disableElms();
			fetch( fetchURL.href )
				.then( response => response.json() )
				.then( payload => {
					disableElms( false );

					$submit.textContent = ggbwo.texts.labelSearch;

					if ( ! payload.success ) {
						$message.textContent = payload.message;
						$message.style.display = '';

						return;
					}

					$result.innerHTML = payload.body;
					$result.style.display = '';
				});
		});
		$body.addEventListener( 'change', function ( e ) {
			if ( e.target.id !== 'orderStatus' ) {
				return;
			}

			const orderId = e.target.dataset.order.trim().replace( /\D/g, '' ),
				fetchURL = new URL( ggbwo.ajaxurl ),
				body = new URLSearchParams();

			body.append( 'action', 'ggbwo_order_status' );
			body.append( 'orderId', orderId );
			body.append( 'status', e.target.value );
			body.append( 'nonce', ggbwo.nonces.status );
			disableElms();
			fetch( fetchURL.href, {
				method: 'POST',
				body: body,
			})
				.then( response => response.json() )
				.then( payload => {
					disableElms( false );

					if ( ! payload.success ) {
						$message.textContent = payload.message;

						return;
					}
				});
		});

		$( '#bwoBarcodeScanner' ).on( 'ggModalOpened', function () {
			$form.querySelector( '[type="text"]' ).focus();
		});

		$( '#bwoBarcodeScanner' ).on( 'ggModalClosed', function () {
			clearElms();
		});
	}

	function clearElms( withForm = true ) {
		const $body = document.querySelector( '#bwoBarcodeScanner .gg-modal-body' ),
			$message = $body.querySelector( '.bwo-scanner-message' ),
			$result = $body.querySelector( '.bwo-scanner-result' );

		if ( withForm ) {
			$body.querySelector( 'form' ).reset();
		}

		$message.style.display = 'none';
		$message.textContent = '';
		$result.style.display = 'none';
		$result.innerHTML = '';
	}

	function disableElms( doDisable = true ) {
		if ( doDisable ) {
			document.querySelectorAll( 'input, textarea, button, select' ).forEach( elm => elm.setAttribute( 'disabled', true ) );
		} else {
			document.querySelectorAll( 'input, textarea, button, select' ).forEach( elm => elm.removeAttribute( 'disabled' ) );
		}
	}
});
