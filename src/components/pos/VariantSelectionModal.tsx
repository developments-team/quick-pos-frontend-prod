import { Modal } from "../ui/Modal";
import type { POSCartItem, POSProduct, POSMode } from "./types";
import type { ProductDetail, ProductVariant } from "../../pages/Products";
import { ProductCard } from "./ProductCard";

interface VariantSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: POSProduct | null;
  onSelectVariant: (product: POSProduct) => void;
  priceMode: POSMode;
  cart: POSCartItem[];
}

export function VariantSelectionModal({
  isOpen,
  onClose,
  product,
  onSelectVariant,
  priceMode,
  cart,
}: VariantSelectionModalProps) {
  if (!product) return null;

  const variants = (product.productDetails as unknown as ProductDetail[]) || [];

  const handleVariantClick = (detail: ProductDetail) => {
    // Construct a temporary product object that represents the selected variant
    // This allows the parent 'addToCart' to process it as a distinct item
    const variantProduct = {
      ...product,
      productDetails: [detail],
    };
    onSelectVariant(variantProduct as unknown as POSProduct);
    onClose();
  };

  // Helper to get formatted attributes from productVariants array in the detail
  const getAttributes = (detail: ProductDetail) => {
    const productVariants = detail.productVariants || [];
    // Filter out any without values just in case
    return productVariants.filter((v: ProductVariant) => v.variantId);
  };

  // Helper to generate a display name for the variant title
  const getVariantTitle = (detail: ProductDetail, index: number) => {
    const attrs = getAttributes(detail);
    if (attrs.length > 0) {
      // e.g. "White,M"
      return attrs.map((v: ProductVariant) => v.variantValue).join(", ");
    }
    return `Variant ${index + 1}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={product.name} size="xl">
      <div className="bg-(--bg-app) -m-1 p-1 rounded-lg">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[60vh] overflow-y-auto custom-scrollbar p-1 pt-1.5">
          {variants.map((detail, index) => {
            const attributes = getAttributes(detail);
            const title = getVariantTitle(detail, index);

            // Construct a temporary product object for this single variant
            // We override the name to be the Variant Title so ProductCard displays it
            const variantProductForCard: POSProduct = {
              ...product,
              name: title, // Use variant title (e.g. "Red, XL") as the card name
              productDetails: [detail],
            };

            // Find if this variant is in the cart
            const cartItem = cart.find(
              (item) =>
                item.productId === product.id &&
                item.productDetailId === detail.id,
            );

            return (
              <ProductCard
                key={detail.id}
                product={variantProductForCard}
                cartItem={cartItem}
                onClick={() => handleVariantClick(detail)}
                priceMode={priceMode}
              >
                {/* Attributes List as Children */}
                {attributes.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-1.5 w-full my-1">
                    {attributes.map((variant: ProductVariant, idx: number) => {
                      // Use nested variant name from the API structure
                      const attrName =
                        variant.variant?.name || variant.name || "Option";
                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-md border border-(--border)/50"
                        >
                          <span className="font-medium">{attrName}:</span>
                          <span className="text-(--text-primary) font-semibold">
                            {variant.variantValue}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ProductCard>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
