<?php
/**
 * Plugin Name: Barcode for WooCommerce Orders
 * Plugin URI: https://github.com/arpsed/gg-woo-barcode
 * Description: Lookup & Generate barcode for WooCommerce orders
 * Version: 1.0.0
 * Author: Dessi Prayogo
 * Author URI: https://github.com/arpsed
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: ggbwo
 * Domain Path: /languages
 *
 * @package gg-woo-barcode
 */

defined( 'ABSPATH' ) || exit;

// phpcs:disable WordPress.Security.EscapeOutput.HeredocOutputNotEscaped

define( 'GGBWO_VER', '1.0.0' );
// define( 'GGBWO_VER', time() );
define( 'GGBWO_PATH', plugin_dir_path( __FILE__ ) );
define( 'GGBWO_URI', plugin_dir_url( __FILE__ ) );

register_activation_hook(
	__FILE__,
	function () {}
);
register_deactivation_hook(
	__FILE__,
	function () {}
);

add_action( 'admin_bar_menu', function ( WP_Admin_Bar $admin_bar ) {
	$admin_bar->add_menu( [
		'id'    => 'bwo-barcode-scanner',
		'title' => __( 'WooCommerce Orders Lookup', 'ggbwo' ),
		'href'  => '#bwoBarcodeScanner',
		'meta'  => [
			'class' => 'bwo-barcode-scanner',
		],
	] );
}, 90 );

add_action( 'add_meta_boxes', function () {
	add_meta_box( 'bwo-order-barcode', esc_html__( 'Barcode', 'ggbwo' ), function () {
		$order_id = wc_get_order()->get_id();
		$title_dl = esc_attr__( 'Download', 'ggbwo' );
		$title_pr = esc_attr__( 'Print', 'ggbwo' );

		echo <<<HTML
<div style="text-align:center">
	<canvas id="bwoOrderBarcode" data-id="{$order_id}"></canvas>
	<p>
		<button id="bwoBarcodeDl" type="button" class="button button-primary" title="{$title_dl}">
			<span class="dashicons dashicons-download" style="vertical-align:middle"></span>
		</button>&nbsp;
		&nbsp;
		&nbsp;
		<button id="bwoBarcodePr" type="button" class="button button-primary" title="{$title_pr}">
			<span class="dashicons dashicons-printer" style="vertical-align:middle"></span>
		</button>
	</p>
</div>
HTML;
	}, [ 'woocommerce_page_wc-orders', 'shop_order' ], 'side', 'high' );
} );

add_action( 'admin_enqueue_scripts', function () {
	wp_enqueue_style( 'ggbwo', GGBWO_URI . 'assets/styles.css', [], GGBWO_VER, 'screen' );
	wp_enqueue_script( 'ggbwo', GGBWO_URI . 'assets/scripts.js', [], GGBWO_VER, true );
	wp_localize_script( 'ggbwo', 'ggbwo', [
		'ajaxurl' => admin_url( 'admin-ajax.php' ),
		'nonces'  => [
			'scanner' => wp_create_nonce( 'ggbwo_get_order' ),
			'status'  => wp_create_nonce( 'ggbwo_order_status' ),
		],
	] );
} );

add_action( 'admin_footer', function () {
	$modal_title = esc_html__( 'WooCommerce Orders Lookup', 'ggbwo' );
	$input_plho  = esc_html__( 'Type or Scan the order number', 'ggbwo' );
	$button_labl = esc_html__( 'Search', 'ggbwo' );

	echo <<<HTML
<aside id="bwoBarcodeScanner" class="gg-modal fade" tabindex="-1" role="dialog">
	<div class="gg-modal-dialog" role="document">
		<div class="gg-modal-content">
			<div class="gg-modal-header">
				<h4 class="gg-modal-title">{$modal_title}</h4>
				<button type="button" class="gg-modal-close">
					<span>&times;</span>
				</button>
			</div>
			<div class="gg-modal-body">
				<form>
					<input type="text" placeholder="{$input_plho}">
					<button type="submit">{$button_labl}</button>
				</form>
				<p class="bwo-scanner-message" style="display:none;"></p>
				<section class="bwo-scanner-result" style="display:none;"></section>
			</div>
		</div>
	</div>
</aside>
HTML;
}, 90 );

add_action( 'wp_ajax_ggbwo_get_order', function () {
	$response = [
		'success' => false,
		'message' => __( 'Nonce required.', 'ggbwo' ),
	];

	if ( ! isset( $_GET['nonce'] ) ) {
		wp_send_json( $response );
	}

	$nonce = sanitize_text_field( wp_unslash( $_GET['nonce'] ) );

	if ( ! wp_verify_nonce( $nonce, 'ggbwo_get_order' ) ) {
		$response['message'] = __( 'Nonce not verified.', 'ggbwo' );

		wp_send_json( $response );
	}

	$order_id = isset( $_GET['orderId'] ) ? sanitize_text_field( wp_unslash( $_GET['orderId'] ) ) : 0;
	$body     = process_order( (int) $order_id );

	if ( 'error' === $body ) {
		$response['message'] = __( 'Order not found.', 'ggbwo' );

		wp_send_json( $response );
	}

	$response = [
		'success' => true,
		'message' => 'ok',
		'body'    => $body,
	];

	wp_send_json( $response );
} );

add_action( 'wp_ajax_ggbwo_order_status', function () {
	$response = [
		'success' => false,
		'message' => __( 'Nonce required.', 'ggbwo' ),
	];

	if ( ! isset( $_POST['nonce'] ) ) {
		wp_send_json( $response );
	}

	$nonce = sanitize_text_field( wp_unslash( $_POST['nonce'] ) );

	if ( ! wp_verify_nonce( $nonce, 'ggbwo_order_status' ) ) {
		$response['message'] = __( 'Nonce not verified.', 'ggbwo' );

		wp_send_json( $response );
	}

	$order_id = isset( $_POST['orderId'] ) ? sanitize_text_field( wp_unslash( $_POST['orderId'] ) ) : 0;
	$status   = isset( $_POST['status'] ) ? sanitize_text_field( wp_unslash( $_POST['status'] ) ) : '';
	$order    = wc_get_order( (int) $order_id );

	if ( false === $order ) {
		$response['message'] = __( 'Order not found.', 'ggbwo' );

		wp_send_json( $response );
	}

	if ( ! array_key_exists( $status, wc_get_order_statuses() ) ) {
		$response['message'] = __( 'Status not found.', 'ggbwo' );

		wp_send_json( $response );
	}

	$order->update_status( $status );

	$response = [
		'success' => true,
		'message' => 'ok',
	];

	wp_send_json( $response );
} );

function process_order( int $order_id ): string {
	$order = wc_get_order( $order_id );

	if ( false === $order ) {
		return 'error';
	}

	$order_id          = $order->get_id();
	$order_type_object = get_post_type_object( $order->get_type() );
	$order_title       = sprintf(
		'%s #%s',
		esc_html( $order_type_object->labels->singular_name ),
		esc_html( $order->get_order_number() ),
	);
	$order_url         = add_query_arg( [
		'post'   => $order_id,
		'action' => 'edit',
	], admin_url( 'post.php' ) );
	$order_address     = wp_kses( $order->get_formatted_billing_address(), [ 'br' => [] ] );
	$order_date        = ! is_null( $order->get_date_created() ) ? $order->get_date_created()->getOffsetTimestamp() : '';
	$order_date        = sprintf(
		'<strong>%s</strong> %s',
		esc_html__( 'Date created:', 'woocommerce' ),
		esc_html( date_i18n( get_option( 'date_format' ), $order_date ) )
	);
	$label_status      = esc_html__( 'Status:', 'woocommerce' );
	$wc_statuses       = '';

	foreach ( wc_get_order_statuses() as $status => $status_name ) {
		$wc_statuses .= sprintf(
			'<option value="%1$s" %2$s>%3$s</option>',
			esc_attr( $status ),
			selected( $status, 'wc-' . $order->get_status( 'edit' ), false ),
			esc_html( $status_name )
		);
	}

	$items = include_once GGBWO_PATH . 'templates/popup-order-items.php';
	$body  = <<<HTML
<h5 class="bwo-order-title">
	<a href="{$order_url}" target="_blank" class="bwo-order-url">{$order_title} <span class="dashicons dashicons-external"></span></a>
</h5>
<div class="bwo-order-data">
	<div>
		<p class="bwo-order-address">{$order_address}</p>
	</div>
	<div>
		<p class="bwo-order-date">{$order_date}</p>
		<p class="bwo-order-status">
			<label for="orderStatus"><strong>{$label_status}</strong></label><br>
			<select id="orderStatus" data-order="{$order_id}">{$wc_statuses}</select>
		</p>
	</div>
</div>
<div class="bwo-order-items">{$items}</div>
HTML;

	return $body;
}
