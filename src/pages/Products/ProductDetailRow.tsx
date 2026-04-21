/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { X } from "lucide-react";
import type { ProductDetail } from "./index";
import { FileChooser } from "../../components/ui/FileChooser";

interface ProductDetailRowProps {
  detail: ProductDetail;
  index: number;
  isStandard: boolean;
  hasInitialQuantity: boolean;
  variantAttributeOptions: { value: string; label: string }[];
  onUpdate: (index: number, field: keyof ProductDetail, value: any) => void;
  onRemove: (index: number) => void;
}

export const ProductDetailRow: React.FC<ProductDetailRowProps> = ({
  detail,
  index,
  isStandard,
  hasInitialQuantity,
  variantAttributeOptions,
  onUpdate,
  onRemove,
}) => {
  const getAttributeLabel = (id: string) => {
    return (
      variantAttributeOptions.find((opt) => opt.value === id)?.label || null
    );

    // return (
    //   variantAttributeOptions.find((opt) => opt.value === id)?.label ||
    //   "Unknown"
    // );
  };

  // Generate a label from selected variant attributes like "Color:Red,Size:M"
  const getVariantLabel = () => {
    if (!detail.productVariants || detail.productVariants.length === 0) {
      return `Variant ${index + 1}`;
    }

    const labels = detail.productVariants
      .map((variant) => {
        const attrLabel = getAttributeLabel(variant.variantId);
        if (attrLabel) {
          return `${attrLabel}: ${variant.variantValue}`;
        }
        return null;
      })
      .filter(Boolean);

    return labels.length > 0 ? labels.join(", ") : `Variant ${index + 1}`;
  };

  return (
    <div className={isStandard ? "" : "pt-1 first:pt-0"}>
      {!isStandard && (
        <div className="mb-2 flex gap-2 whitespace-nowrap">
          <div>{getVariantLabel()}</div>
        </div>
      )}

      <div
        className={
          isStandard
            ? "grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
            : hasInitialQuantity
              ? "grid grid-cols-[repeat(7,1fr)_auto] gap-2 items-end"
              : "grid grid-cols-[repeat(6,1fr)_auto] gap-2 items-end"
        }
      >
        {/* SKU */}
        <div
          className={`${
            isStandard ? "md:col-span-4" : "col-span-1"
          } flex flex-col gap-1.5`}
        >
          <Label>SKU</Label>
          <Input
            value={detail.sku || ""}
            onChange={(e) => onUpdate(index, "sku", e.target.value)}
          />
        </div>

        {/* Barcode */}
        <div
          className={`${
            isStandard ? "md:col-span-4" : "col-span-1"
          } flex flex-col gap-1.5`}
        >
          <Label>Barcode</Label>
          <Input
            value={detail.barcode || ""}
            onChange={(e) => onUpdate(index, "barcode", e.target.value)}
          />
        </div>

        {/* Purchase */}
        <div
          className={`${
            isStandard ? "md:col-span-4" : "col-span-1"
          } flex flex-col gap-1.5`}
        >
          <Label>Purchase Price</Label>
          <Input
            type="number"
            value={detail.purchasePrice || ""}
            onChange={(e) =>
              onUpdate(index, "purchasePrice", parseFloat(e.target.value) || 0)
            }
          />
        </div>

        {/* Sale */}
        <div
          className={`${
            isStandard ? "md:col-span-4" : "col-span-1"
          } flex flex-col gap-1.5`}
        >
          <Label>Sale Price</Label>
          <Input
            type="number"
            value={detail.salePrice || ""}
            onChange={(e) =>
              onUpdate(index, "salePrice", parseFloat(e.target.value) || 0)
            }
          />
        </div>

        {/* Qty */}
        {hasInitialQuantity && (
          <div
            className={`${
              isStandard ? "md:col-span-4" : "col-span-1"
            } flex flex-col gap-1.5`}
          >
            <Label>Qty</Label>
            <Input
              type="number"
              value={detail.quantity || ""}
              onChange={(e) =>
                onUpdate(index, "quantity", parseFloat(e.target.value) || 0)
              }
            />
          </div>
        )}

        {/* ReOrder */}
        <div
          className={`${
            isStandard ? "md:col-span-4" : "col-span-1"
          } flex flex-col gap-1.5`}
        >
          <Label>ReOrder</Label>
          <Input
            type="number"
            value={detail.reOrder || ""}
            onChange={(e) =>
              onUpdate(index, "reOrder", parseFloat(e.target.value) || 0)
            }
          />
        </div>

        {/* Image - Only shown if NOT standard */}
        {!isStandard && (
          <div className="col-span-1 flex flex-col gap-1.5 min-w-0">
            <Label>Image</Label>
            <FileChooser
              onChange={(file: File | null) =>
                onUpdate(index, "productImage", file)
              }
              accept="image/*"
              label="Image"
              isMini={true}
            />
          </div>
        )}

        {!isStandard && (
          <div className="ml-3 col-span-1 flex justify-end pb-1">
            <Button
              type="button"
              variant="danger"
              label
              size="sm"
              onClick={() => onRemove(index)}
              title="Remove Variant"
            >
              <X size={16} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
