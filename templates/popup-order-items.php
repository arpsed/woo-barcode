<?php
/**
 * Shows an order in popup
 *
 * @param WC_Order $order The Order object.
 * @package gg-woo-barcode
 */

defined( 'ABSPATH' ) || exit;

// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped

$line_items = $order->get_items( apply_filters( 'woocommerce_admin_order_item_types', 'line_item' ) );

ob_start();
?>

<table cellpadding="0" cellspacing="0" class="">
	<thead>
		<tr>
			<th class=""><?php esc_html_e( 'Item', 'woocommerce' ); ?></th>
			<th class=""><?php esc_html_e( 'Cost', 'woocommerce' ); ?></th>
			<!-- <th class=""><?php esc_html_e( 'Qty', 'woocommerce' ); ?></th>
			<th class=""><?php esc_html_e( 'Total', 'woocommerce' ); ?></th> -->
		</tr>
	</thead>
	<tbody>
<?php
$currency = [ 'currency' => $order->get_currency() ];

foreach ( $line_items as $item_id => $item ) :
	?>

		<tr>
			<td class=""><?php echo wp_kses_post( $item->get_name() ); ?></td>
			<td class=""><?php echo wc_price( $order->get_item_subtotal( $item, false, true ), $currency ); ?></td>
			<!-- <td class=""><?php echo '<small class="times">&times;</small> ' . esc_html( $item->get_quantity() ); ?></td>
			<td class="">
	<?php
	echo wc_price( $item->get_total(), $currency );

	if ( $item->get_subtotal() !== $item->get_total() ) {
		// translators: %s: discount amount
		echo '<span class="">' . sprintf( esc_html__( '%s discount', 'woocommerce' ), wc_price( wc_format_decimal( $item->get_subtotal() - $item->get_total(), '' ), $currency ) ) . '</span>';
	}
	?>

			</td> -->
		</tr>
<?php endforeach; ?>

	</tbody>
</table>
<?php
return ob_get_clean();
