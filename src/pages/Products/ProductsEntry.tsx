/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { Button } from "../../components/ui/Button";
import { PageContainer, PageHeader } from "../../components/layout/Page";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { Spinner } from "../../components/ui/Spinner";
import { Combobox } from "../../components/ui/Combobox";
import { Switch } from "../../components/ui/Switch";
import { useProvider } from "../../context/Provider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type Product, type ProductDetail } from "./index";
import { Plus, X, ArrowLeft } from "lucide-react";
import { RadioGroup, CardRadioGroupItem } from "../../components/ui/RadioGroup";
import { toast } from "../../components/ui/Toast";
import { ProductDetailRow } from "./ProductDetailRow";
import { FileChooser } from "../../components/ui/FileChooser";
import { Textarea } from "../../components/ui/Textarea";
import { CategoriesEntry } from "../Categories";
import { BrandsEntry } from "../Brands";
import { GroupsEntry } from "../Groups";
import { UnitsEntry } from "../Units";
import { VariantAttributesEntry } from "../VariantAttributes";
import { TaxesEntry } from "../Taxes";
import { BranchesEntry } from "../Branches";
import { ChipSelector } from "../../components/ui/ChipSelector";

const emptyProductDetail: ProductDetail = {
  id: "",
  sku: "",
  barcode: "",
  purchasePrice: 0,
  salePrice: 0,
  quantity: 0,
  reOrder: 0,
  productImage: "",
  productVariants: [],
};

const emptyProduct: Product = {
  id: "",
  name: "",
  description: "",
  categoryId: "",
  brandId: "",
  groupId: "",
  productMode: "retail",
  purchaseUnitId: "",
  saleUnitId: "",
  rate: 0,
  taxId: "",
  productImage: "",
  productType: "standard",
  hasInitialQuantity: false,
  assetAccountId: "",
  revenueAccountId: "",
  COGsAccountId: "",
  saleReturnAccountId: "",
  branchId: "",
  paymentType: "",
  subTotal: 0,
  productAvailability: "",
  expiryDate: "",
  productDetails: [{ ...emptyProductDetail }],
  user: "",
};

export function ProductsEntry() {
  const navigate = useNavigate();
  // We no longer use useParams because the ID is hidden in the state
  // const { id } = useParams();
  const location = useLocation();
  const queryClient = useQueryClient();

  const {
    createNewProduct,
    updateProduct,
    getCategories,
    getBrands,
    getGroups,
    getUnits,
    getVariantAttributes,
    getTaxes,
    getBranches,
  } = useProvider();

  /* -------------------------------------------------------------------------- */
  /*                                    State                                   */
  /* -------------------------------------------------------------------------- */
  // Get product from location state
  const productFromState = location.state as Product | undefined;

  // If we are "editing" but have no product state, it means the user likely refreshed the page
  // or navigated here directly. In that case, we MUST redirect back to the list
  // because we don't have an ID in the URL to fetch with.
  useEffect(() => {
    // Check if we are at the "edit" path (you might want a more robust check)
    if (location.pathname.includes("/edit") && !productFromState) {
      // toast.error("Product data lost. Redirecting to products list.");
      toast.error("Please select a product to edit.");
      navigate("/products");
    }
  }, [location, productFromState, navigate]);

  const product = productFromState;
  const id = product?.id; // derived from state

  const [formData, setFormData] = useState<Product>(emptyProduct);

  // Load product data when editing
  useEffect(() => {
    if (product) {
      setFormData({
        ...emptyProduct,
        ...product,
        // Ensure nested objects are handled if necessary
      });
      // Set active attributes based on loaded product
      if (product.productType === "variant") {
        const uniqueAttributes = new Set<string>();
        product.productDetails?.forEach((detail: any) => {
          detail.productVariants?.forEach((variant: any) => {
            variant.attributes?.forEach((attr: any) => {
              uniqueAttributes.add(attr.name);
            });
          });
        });
        // We need to fetch attribute details to populate fully if needed
        // For now, let's rely on existing logic or just set empty if complex
      }
    } else {
      setFormData(emptyProduct);
    }
  }, [product]);
  const [activeAttributes, setActiveAttributes] = useState<
    { id: string; label: string }[]
  >([]);
  const [attributeValues, setAttributeValues] = useState<
    Record<string, string>
  >({});
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Modal states for addon forms
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isAddBrandModalOpen, setIsAddBrandModalOpen] = useState(false);
  const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false);
  const [isAddUnitModalOpen, setIsAddUnitModalOpen] = useState(false);
  const [isAddVariantAttributeModalOpen, setIsAddVariantAttributeModalOpen] =
    useState(false);
  const [isAddTaxModalOpen, setIsAddTaxModalOpen] = useState(false);
  const [isAddBranchModalOpen, setIsAddBranchModalOpen] = useState(false);

  const [errors, setErrors] = useState<{
    name?: string;
  }>({});

  const [activeUnitField, setActiveUnitField] = useState<
    "purchase" | "sale" | "wholesale" | null
  >(null);

  const isEditing = !!id;

  // Fetch dropdowns data
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
    select: (res: any) => (Array.isArray(res) ? res : res?.data || []),
  });

  const { data: brands = [] } = useQuery({
    queryKey: ["brands"],
    queryFn: () => getBrands(),
    select: (res: any) => (Array.isArray(res) ? res : res?.data || []),
  });

  const { data: groups = [] } = useQuery({
    queryKey: ["groups"],
    queryFn: () => getGroups(),
    select: (res: any) => (Array.isArray(res) ? res : res?.data || []),
  });

  const { data: units = [] } = useQuery({
    queryKey: ["units"],
    queryFn: () => getUnits(),
    select: (res: any) => (Array.isArray(res) ? res : res?.data || []),
  });

  const { data: variantAttributes = [] } = useQuery({
    queryKey: ["variantAttributes"],
    queryFn: () => getVariantAttributes(),
    select: (res: any) => (Array.isArray(res) ? res : res?.data || []),
  });

  // Reset form when product prop or isOpen changes
  useEffect(() => {
    const initial: Product =
      product && Object.keys(product).length > 0
        ? { ...product }
        : { ...emptyProduct };

    if (!initial.productType) {
      initial.productType = "standard";
    }

    if (!initial.productMode) {
      initial.productMode = "retail";
    }

    if (
      initial.productType === "standard" &&
      (!initial.productDetails || initial.productDetails.length === 0)
    ) {
      initial.productDetails = [{ ...emptyProductDetail }];
    }

    setFormData(initial);
    setImageFile(null);
    setErrors({});
    setActiveAttributes([]);
    setAttributeValues({});
  }, [product]);

  // Populate activeAttributes from existing product variants when editing (separate effect)
  useEffect(() => {
    if (
      product?.productType === "variant" &&
      product?.productDetails &&
      product.productDetails.length > 0 &&
      variantAttributes.length > 0
    ) {
      // Extract unique variant attribute IDs from all product details
      const uniqueAttributeIds = new Set<string>();
      product.productDetails.forEach((detail: any) => {
        detail.productVariants?.forEach((variant: any) => {
          if (variant.variantId) {
            uniqueAttributeIds.add(variant.variantId);
          }
        });
      });

      // Map to activeAttributes format using variantAttributes data
      const attrs = Array.from(uniqueAttributeIds)
        .map((id) => {
          const attr = variantAttributes.find((a: any) => a.id === id);
          return attr ? { id: attr.id, label: attr.name } : null;
        })
        .filter(Boolean) as { id: string; label: string }[];

      if (attrs.length > 0) {
        setActiveAttributes(attrs);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id, variantAttributes.length]);

  const { data: taxes = [] } = useQuery({
    queryKey: ["taxes"],
    queryFn: () => getTaxes(),
    select: (res: any) => (Array.isArray(res) ? res : res?.data || []),
  });

  const { data: branches = [] } = useQuery({
    queryKey: ["branches"],
    queryFn: () => getBranches(),
    select: (res: any) => (Array.isArray(res) ? res : res?.data || []),
  });

  const createProductMutation = useMutation({
    mutationFn: (data: FormData) => createNewProduct(data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      if (data.status !== false) {
        toast.success(data.message || "Product created successfully");
        navigate("/products");
      } else {
        toast.error(data.message || "Failed to create product");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) =>
      updateProduct(id, data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      if (data.status !== false) {
        toast.success(data.message || "Product updated successfully");
        navigate("/products");
      } else {
        toast.error(data.message || "Failed to update product");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const isPending =
    createProductMutation.isPending || updateProductMutation.isPending;

  const validateForm = () => {
    const newErrors: { name?: string } = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildFormData = (): FormData => {
    const fd = new FormData();

    fd.append("name", formData.name || "");
    fd.append("description", formData.description || "");
    fd.append("categoryId", formData.categoryId || "");
    fd.append("brandId", formData.brandId || "");
    fd.append("groupId", formData.groupId || "");
    fd.append("purchaseUnitId", formData.purchaseUnitId || "");
    fd.append("saleUnitId", formData.saleUnitId || "");
    fd.append("rate", String(formData.rate || 0));
    fd.append("taxId", formData.taxId || "");
    fd.append("productType", formData.productType || "");
    fd.append("hasInitialQuantity", String(formData.hasInitialQuantity));
    fd.append("assetAccountId", formData.assetAccountId || "");
    fd.append("revenueAccountId", formData.revenueAccountId || "");
    fd.append("COGsAccountId", formData.COGsAccountId || "");
    fd.append("saleReturnAccountId", formData.saleReturnAccountId || "");
    fd.append("branchId", formData.branchId || "");
    fd.append("paymentType", formData.paymentType || "");
    fd.append("subTotal", String(formData.subTotal || 0));
    fd.append("productAvailability", formData.productAvailability || "");
    fd.append("expiryDate", formData.expiryDate || "");
    fd.append(
      "user",
      JSON.parse(localStorage.getItem("user_data") || "{}")?.id,
    );

    if (imageFile) {
      fd.append("productImage", imageFile);
    }

    if (formData.productDetails && formData.productDetails.length > 0) {
      formData.productDetails.forEach((detail, index) => {
        // Only send ID if it's a valid non-empty string (for existing records)
        if (detail.id && detail.id.trim() !== "") {
          fd.append(`productDetails[${index}][id]`, detail.id);
        }
        fd.append(`productDetails[${index}][sku]`, detail.sku || "");
        fd.append(`productDetails[${index}][barcode]`, detail.barcode || "");
        fd.append(
          `productDetails[${index}][purchasePrice]`,
          String(detail.purchasePrice || 0),
        );
        fd.append(
          `productDetails[${index}][salePrice]`,
          String(detail.salePrice || 0),
        );
        fd.append(
          `productDetails[${index}][quantity]`,
          String(detail.quantity || 0),
        );
        fd.append(
          `productDetails[${index}][reOrder]`,
          String(detail.reOrder || 0),
        );
        fd.append(
          `productDetails[${index}][productImage]`,
          detail.productImage || "",
        );

        // Serialize productVariants as nested array
        if (detail.productVariants && detail.productVariants.length > 0) {
          detail.productVariants.forEach((variant, variantIndex) => {
            fd.append(
              `productDetails[${index}][productVariants][${variantIndex}][variantId]`,
              variant.variantId || "",
            );
            fd.append(
              `productDetails[${index}][productVariants][${variantIndex}][variantValue]`,
              variant.variantValue || "",
            );
            fd.append(
              `productDetails[${index}][productVariants][${variantIndex}][color]`,
              variant.color || "",
            );
          });
        }
      });
    }

    return fd;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const payload = buildFormData();
      if (isEditing && formData.id) {
        updateProductMutation.mutate({ id: formData.id, data: payload });
      } else {
        createProductMutation.mutate(payload);
      }
    }
  };

  const handleBlur = (field: "name") => {
    setErrors((prev) => {
      const next = { ...prev };
      const value = formData[field]?.trim() || "";

      if (!value) {
        next[field] = `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } is required`;
        return next;
      }

      delete next[field];
      return next;
    });
  };

  const removeProductDetail = (index: number) => {
    const newDetails = (formData.productDetails || []).filter(
      (_, i) => i !== index,
    );
    setFormData({ ...formData, productDetails: newDetails });
  };

  const updateProductDetail = (
    index: number,
    field: keyof ProductDetail,
    value: any,
  ) => {
    const newDetails = [...(formData.productDetails || [])];
    newDetails[index] = { ...newDetails[index], [field]: value };
    setFormData({ ...formData, productDetails: newDetails });
  };

  /* -------------------------------------------------------------------------- */
  /*                           Product Detail Caching                           */
  /* -------------------------------------------------------------------------- */
  // We use this to store the "Variant" rows when the user switches to "Standard"
  // so that if they switch back, we can restore them.
  const [cachedDetails, setCachedDetails] = useState<ProductDetail[]>([]);

  const handleProductTypeChange = (value: string) => {
    const updatedFormData = { ...formData, productType: value };

    if (value === "standard") {
      // Switching Standard -> Variant
      // 1. Cache the current details so we don't lose them if user switches back
      if (formData.productDetails && formData.productDetails.length > 0) {
        setCachedDetails(formData.productDetails);
      }

      // 2. Keep only the first detail row (or create a new empty one if none exist)
      if (
        updatedFormData.productDetails &&
        updatedFormData.productDetails.length > 0
      ) {
        // Keep the first one
        updatedFormData.productDetails = [updatedFormData.productDetails[0]];
      } else {
        // No details at all, add one empty
        updatedFormData.productDetails = [{ ...emptyProductDetail }];
      }
    } else if (value === "variant") {
      // Switching Standard -> Variant

      // 1. Try to restore from cache if we have more than just the current single row in cache
      //    (Simple heuristic: if cache has > 1 item, or if cache has 1 item that is different/more populated)
      //    For now, the user request says "keep products detail when variants... and when again variant view all details keeped"
      // This implies full restoration or at least not losing the hidden rows.

      if (cachedDetails.length > 0) {
        // We have history.
        // Let's take the CURRENT first row (which might have been edited in Standard mode)
        // and update the first row of the cached details with it, then restore all.
        const currentFirstRow = formData.productDetails?.[0];
        const restoredDetails = [...cachedDetails];

        if (currentFirstRow) {
          restoredDetails[0] = { ...restoredDetails[0], ...currentFirstRow };
        }
        updatedFormData.productDetails = restoredDetails;
      } else {
        // No cache history (first time switching to Variant, or nothing was there).
        // JUST KEEP what we have. Do NOT clear it.
        // The previous code was: updatedFormData.productDetails = []; (which wiped it)
        // Now we do nothing, so it preserves the current single row as the first variant row.
        if (
          !updatedFormData.productDetails ||
          updatedFormData.productDetails.length === 0
        ) {
          updatedFormData.productDetails = [{ ...emptyProductDetail }];
        }
      }

      if (variantAttributes.length > 0 && activeAttributes.length === 0) {
        setActiveAttributes(
          variantAttributes.map((attr: any) => ({
            id: attr.id,
            label: attr.name,
          })),
        );
      }
    }
    setFormData(updatedFormData);
  };

  const categoryOptions = categories.map((c: any) => ({
    value: c.id,
    label: c.name,
  }));

  const brandOptions = brands.map((b: any) => ({
    value: b.id,
    label: b.name,
  }));

  const groupOptions = groups.map((g: any) => ({
    value: g.id,
    label: g.name,
  }));

  const unitOptions = units.map((u: any) => ({
    value: u.id,
    label: u.name,
  }));

  const variantAttributeOptions = variantAttributes.map((v: any) => ({
    value: v.id,
    label: v.name,
  }));

  const taxOptions = taxes.map((t: any) => ({
    value: t.id,
    label: t.name,
  }));

  const branchOptions = branches.map((b: any) => ({
    value: b.id,
    label: b.name,
  }));

  const handleAddProductDetail = () => {
    const newVariantDetail: ProductDetail = {
      ...emptyProductDetail,
      productVariants: activeAttributes.map((attr) => ({
        variantId: attr.id,
        variantValue: attributeValues[attr.id] || "",
        color: "",
      })),
    };

    setFormData({
      ...formData,
      productDetails: [...(formData.productDetails || []), newVariantDetail],
    });

    // Clear values after adding to prevent double add
    setAttributeValues({});
  };

  const handleSelectAttribute = (val: string | string[]) => {
    if (Array.isArray(val)) {
      // Build new active attributes list from the array of IDs
      const newActive = val
        .map((id) => {
          // Check if already in activeAttributes
          const existing = activeAttributes.find((a) => a.id === id);
          if (existing) return existing;
          // Otherwise, find from variantAttributes
          const attr = variantAttributes.find((a: any) => a.id === id);
          return attr ? { id: attr.id, label: attr.name } : null;
        })
        .filter(Boolean) as { id: string; label: string }[];

      setActiveAttributes(newActive);

      // Sync attribute values - keep values for attributes that still exist
      const newValues: Record<string, string> = {};
      val.forEach((id) => {
        if (attributeValues[id]) {
          newValues[id] = attributeValues[id];
        }
      });
      setAttributeValues(newValues);
      return;
    }

    const attributeId = val;
    const attribute = variantAttributes.find((a: any) => a.id === attributeId);
    if (attribute && !activeAttributes.find((a) => a.id === attributeId)) {
      setActiveAttributes([
        ...activeAttributes,
        { id: attribute.id, label: attribute.name },
      ]);
    }
  };

  const handleRemoveActiveAttribute = (attributeId: string) => {
    setActiveAttributes(activeAttributes.filter((a) => a.id !== attributeId));
    const newValues = { ...attributeValues };
    delete newValues[attributeId];
    setAttributeValues(newValues);
  };

  return (
    <PageContainer>
      <PageHeader
        title={id ? "Edit Product" : "Add Product"}
        action={
          <Button outline onClick={() => navigate("/products")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />
      <div className="mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setFormData({ ...formData, name: e.target.value });

                  // Clear error when user types
                  if (errors.name) {
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.name;
                      return next;
                    });
                  }
                }}
                onBlur={() => handleBlur("name")}
                hasError={!!errors.name}
              />
              {errors.name && (
                <span className="text-sm text-red-500">{errors.name}</span>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData({
                    ...formData,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Category</Label>
              <Combobox
                options={categoryOptions}
                value={formData.categoryId}
                onChange={(value: string) => {
                  setFormData({ ...formData, categoryId: value });
                }}
                placeholder="Select category..."
                // searchable={false}
                rightAddon={
                  <Button
                    type="button"
                    ghost
                    className="px-3 rounded-none h-9.5 rounded-r-md"
                    onClick={() => setIsAddCategoryModalOpen(true)}
                    tabIndex={-1}
                  >
                    <Plus size={16} />
                  </Button>
                }
                rightAddonClassName="p-0 "
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Brand</Label>
              <Combobox
                options={brandOptions}
                value={formData.brandId}
                onChange={(value: string) =>
                  setFormData({ ...formData, brandId: value })
                }
                placeholder="Select brand..."
                // searchable={false}
                rightAddon={
                  <Button
                    type="button"
                    ghost
                    className="px-3 rounded-none h-9.5 rounded-r-md"
                    onClick={() => setIsAddBrandModalOpen(true)}
                    tabIndex={-1}
                  >
                    <Plus size={16} />
                  </Button>
                }
                rightAddonClassName="p-0 "
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Group</Label>
              <Combobox
                options={groupOptions}
                value={formData.groupId}
                onChange={(value: string) =>
                  setFormData({ ...formData, groupId: value })
                }
                placeholder="Select group..."
                // searchable={false}
                rightAddon={
                  <Button
                    type="button"
                    ghost
                    className="px-3 rounded-none h-9.5 rounded-r-md"
                    onClick={() => setIsAddGroupModalOpen(true)}
                    tabIndex={-1}
                  >
                    <Plus size={16} />
                  </Button>
                }
                rightAddonClassName="p-0 "
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Tax</Label>
              <Combobox
                options={taxOptions}
                value={formData.taxId}
                onChange={(value: string) =>
                  setFormData({ ...formData, taxId: value })
                }
                placeholder="Select tax..."
                rightAddon={
                  <Button
                    type="button"
                    ghost
                    className="px-3 rounded-none h-9.5 rounded-r-md"
                    onClick={() => setIsAddTaxModalOpen(true)}
                    tabIndex={-1}
                  >
                    <Plus size={16} />
                  </Button>
                }
                rightAddonClassName="p-0 "
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Product Image</Label>

              <FileChooser
                onChange={(file: File | null) => setImageFile(file)}
                accept="image/*"
                label="Choose images only"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Product Mode</Label>
              <RadioGroup
                value={
                  formData.productMode?.toLowerCase() === "retail"
                    ? "retail"
                    : "wholesale"
                }
                onValueChange={(value: string) => {
                  const updates: Partial<Product> = {
                    productMode: value,
                  };
                  if (value === "wholesale") {
                    updates.rate = 1;
                  } else {
                    updates.rate = undefined;
                  }
                  setFormData({ ...formData, ...updates });
                }}
                className="grid grid-cols-2 gap-4"
              >
                <CardRadioGroupItem
                  value="retail"
                  title="Retail"
                  className="h-10 rounded-md py-1.5 px-3 pr-7"
                />
                <CardRadioGroupItem
                  value="wholesale"
                  title="Wholesale"
                  className="h-10 rounded-md py-1.5 px-3 pr-7"
                />
              </RadioGroup>
            </div>

            {formData.productMode === "wholesale" ? (
              <div className="flex flex-col gap-1.5">
                <Label>Unit</Label>
                <Combobox
                  options={unitOptions}
                  value={formData.saleUnitId}
                  onChange={(value: string) =>
                    setFormData({
                      ...formData,
                      saleUnitId: value,
                      purchaseUnitId: value,
                    })
                  }
                  placeholder="Select unit..."
                  // searchable={false}
                  rightAddon={
                    <Button
                      type="button"
                      ghost
                      className="px-3 rounded-none h-9.5 rounded-r-md"
                      onClick={() => {
                        setActiveUnitField("wholesale");
                        setIsAddUnitModalOpen(true);
                      }}
                      tabIndex={-1}
                    >
                      <Plus size={16} />
                    </Button>
                  }
                  rightAddonClassName="p-0 "
                />
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-1.5">
                  <Label>Purchase Unit</Label>
                  <Combobox
                    options={unitOptions}
                    value={formData.purchaseUnitId}
                    onChange={(value: string) =>
                      setFormData({ ...formData, purchaseUnitId: value })
                    }
                    placeholder="Select unit..."
                    // searchable={false}
                    rightAddon={
                      <Button
                        type="button"
                        ghost
                        className="px-3 rounded-none h-9.5 rounded-r-md"
                        onClick={() => {
                          setActiveUnitField("purchase");
                          setIsAddUnitModalOpen(true);
                        }}
                        tabIndex={-1}
                      >
                        <Plus size={16} />
                      </Button>
                    }
                    rightAddonClassName="p-0 "
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Sale Unit</Label>
                  <Combobox
                    options={unitOptions}
                    value={formData.saleUnitId}
                    onChange={(value: string) =>
                      setFormData({ ...formData, saleUnitId: value })
                    }
                    placeholder="Select unit..."
                    // searchable={false}
                    rightAddon={
                      <Button
                        type="button"
                        ghost
                        className="px-3 rounded-none h-9.5 rounded-r-md"
                        onClick={() => {
                          setActiveUnitField("sale");
                          setIsAddUnitModalOpen(true);
                        }}
                        tabIndex={-1}
                      >
                        <Plus size={16} />
                      </Button>
                    }
                    rightAddonClassName="p-0 "
                  />
                </div>
              </>
            )}
            {formData.productMode !== "wholesale" && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="rate">Rate</Label>
                <Input
                  id="rate"
                  type="number"
                  value={formData.rate || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const val = parseFloat(e.target.value);
                    setFormData({
                      ...formData,
                      rate: isNaN(val) ? 0 : val,
                    });
                  }}
                />
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <Label>Product Type</Label>
              <RadioGroup
                value={
                  formData.productType?.toLowerCase() === "variant"
                    ? "variant"
                    : "standard"
                }
                onValueChange={handleProductTypeChange}
                className="grid grid-cols-2 gap-4"
              >
                <CardRadioGroupItem
                  value="standard"
                  title="Standard"
                  className="h-10 rounded-md py-1.5 px-3 pr-5"
                />
                <CardRadioGroupItem
                  value="variant"
                  title="Variant"
                  className="h-10 rounded-md py-1.5 px-3 pr-5"
                />
              </RadioGroup>
            </div>
            <div className="flex flex-col gap-1.5 my-4">
              <Label>Has Initial Quantity</Label>
              <Switch
                id="hasInitialQuantity"
                checked={formData.hasInitialQuantity}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setFormData({
                    ...formData,
                    hasInitialQuantity: e.target.checked,
                  });
                }}
              />
            </div>
            {formData.hasInitialQuantity && (
              <div className="flex flex-col gap-1.5">
                <Label>Branch</Label>
                <Combobox
                  options={branchOptions}
                  value={formData.branchId}
                  onChange={(value: string) =>
                    setFormData({ ...formData, branchId: value })
                  }
                  placeholder="Select branch..."
                  rightAddon={
                    <Button
                      type="button"
                      ghost
                      className="px-3 rounded-none h-9.5 rounded-r-md"
                      onClick={() => setIsAddBranchModalOpen(true)}
                      tabIndex={-1}
                    >
                      <Plus size={16} />
                    </Button>
                  }
                  rightAddonClassName="p-0 "
                />
              </div>
            )}
          </div>
          {formData.productType?.toLowerCase() === "variant" && (
            <>
              {/* Attribute Selector */}
              <div className="flex flex-col gap-2 max-w-full">
                <Label className="whitespace-nowrap">
                  Add Product Variants
                </Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    label
                    onClick={() => setIsAddVariantAttributeModalOpen(true)}
                    tabIndex={-1}
                    className="rounded-full shrink-0"
                  >
                    <Plus size={16} />
                  </Button>
                  <ChipSelector
                    multiple
                    value={activeAttributes.map((a) => a.id)}
                    onChange={(value) => handleSelectAttribute(value)}
                    options={variantAttributeOptions}
                  />
                </div>
              </div>

              {/* Active Attributes Inputs */}
              {activeAttributes.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-2">
                  {activeAttributes.map((attr) => (
                    <div key={attr.id} className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center">
                        <Label>{attr.label}</Label>
                      </div>
                      <Input
                        value={attributeValues[attr.id] || ""}
                        onChange={(e) =>
                          setAttributeValues({
                            ...attributeValues,
                            [attr.id]: e.target.value,
                          })
                        }
                        placeholder={`Enter ${attr.label} value...`}
                        rightAddon={
                          <Button
                            variant="danger"
                            ghost
                            className="px-3 rounded-none h-9.5 rounded-r-md"
                            onClick={() => handleRemoveActiveAttribute(attr.id)}
                            tabIndex={-1}
                          >
                            <X size={16} />
                          </Button>
                        }
                        rightAddonClassName="p-0 "
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end pt-2 gap-2">
                <Button
                  type="button"
                  onClick={() => {
                    setAttributeValues({});
                    setActiveAttributes([]);
                  }}
                  disabled={activeAttributes.length === 0}
                  className="w-full sm:w-auto"
                  variant="danger"
                  label
                >
                  <X size={16} className="mr-2" />
                  Clear
                </Button>
                <Button
                  type="button"
                  onClick={handleAddProductDetail}
                  disabled={
                    activeAttributes.length === 0 ||
                    activeAttributes.some((a) => !attributeValues[a.id])
                  }
                  className="w-full sm:w-auto"
                  label
                  // variant="success"
                >
                  <Plus size={16} className="mr-2" />
                  Add
                </Button>
              </div>
            </>
          )}
          {(() => {
            const isStandard =
              formData.productType?.toLowerCase() === "standard";
            const hasVariants =
              formData.productDetails &&
              formData.productDetails.some(
                (d) => d.productVariants && d.productVariants.length > 0,
              );

            if (!isStandard && !hasVariants) return null;

            const content = (() => {
              if (
                !formData.productDetails ||
                formData.productDetails.length === 0
              ) {
                return (
                  <div className="text-center py-6 text-(--text-muted) border border-dashed border-(--border) rounded-lg">
                    No product details available.
                  </div>
                );
              }

              // For variant mode, we need to track visible index for showLabels
              return formData.productDetails.map((detail, index) => {
                if (
                  !isStandard &&
                  (!detail.productVariants ||
                    detail.productVariants.length === 0)
                ) {
                  return null;
                }
                return (
                  <ProductDetailRow
                    key={detail.id || index}
                    detail={detail}
                    index={index}
                    isStandard={isStandard}
                    hasInitialQuantity={formData.hasInitialQuantity!}
                    variantAttributeOptions={variantAttributeOptions}
                    onUpdate={updateProductDetail}
                    onRemove={removeProductDetail}
                  />
                );
              });
            })();

            return (
              <div>
                {isStandard ? (
                  content
                ) : (
                  <div className="overflow-x-auto pb-3 -mb-2 px-0.25">
                    <div className="min-w-4xl lg:min-w-3xl ">{content}</div>
                  </div>
                )}
              </div>
            );
          })()}
          {/* Footer Buttons */}
          <div className="flex justify-end gap-2 mt-6 pt-4">
            <Button
              type="button"
              variant="secondary"
              label
              onClick={() => {
                navigate("/products");
              }}
            >
              Close
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Spinner
                    size="sm"
                    variant="gradient-ring"
                    className="mr-2"
                    strokeWidth={2}
                  />
                  {isEditing ? "Updating..." : "Saving..."}
                </>
              ) : isEditing ? (
                "Update"
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </form>

        {/* Nested Addon Forms */}
        <CategoriesEntry
          isOpen={isAddCategoryModalOpen}
          onClose={() => setIsAddCategoryModalOpen(false)}
          onSuccess={(newId) => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            setFormData({ ...formData, categoryId: newId });
          }}
        />
        <BrandsEntry
          isOpen={isAddBrandModalOpen}
          onClose={() => setIsAddBrandModalOpen(false)}
          onSuccess={(newId) => {
            queryClient.invalidateQueries({ queryKey: ["brands"] });
            setFormData({ ...formData, brandId: newId });
          }}
        />
        <GroupsEntry
          isOpen={isAddGroupModalOpen}
          onClose={() => setIsAddGroupModalOpen(false)}
          onSuccess={(newId) => {
            queryClient.invalidateQueries({ queryKey: ["groups"] });
            setFormData({ ...formData, groupId: newId });
          }}
        />
        <UnitsEntry
          isOpen={isAddUnitModalOpen}
          onClose={() => setIsAddUnitModalOpen(false)}
          onSuccess={(newId) => {
            queryClient.invalidateQueries({ queryKey: ["units"] });
            if (activeUnitField === "wholesale") {
              setFormData({
                ...formData,
                saleUnitId: newId,
                purchaseUnitId: newId,
              });
            } else if (activeUnitField === "purchase") {
              setFormData({ ...formData, purchaseUnitId: newId });
            } else if (activeUnitField === "sale") {
              setFormData({ ...formData, saleUnitId: newId });
            }
            setActiveUnitField(null);
          }}
        />
        <VariantAttributesEntry
          isOpen={isAddVariantAttributeModalOpen}
          onClose={() => setIsAddVariantAttributeModalOpen(false)}
          onSuccess={(newAttribute) => {
            queryClient.invalidateQueries({ queryKey: ["variantAttributes"] });
            if (newAttribute?.id && newAttribute?.name) {
              setActiveAttributes([
                ...activeAttributes,
                { id: newAttribute.id, label: newAttribute.name },
              ]);
            }
          }}
        />
        <TaxesEntry
          isOpen={isAddTaxModalOpen}
          onClose={() => setIsAddTaxModalOpen(false)}
          onSuccess={(newId) => {
            queryClient.invalidateQueries({ queryKey: ["taxes"] });
            setFormData({ ...formData, taxId: newId });
          }}
        />
        <BranchesEntry
          isOpen={isAddBranchModalOpen}
          onClose={() => setIsAddBranchModalOpen(false)}
          onSuccess={(newId) => {
            queryClient.invalidateQueries({ queryKey: ["branches"] });
            setFormData({ ...formData, branchId: newId });
          }}
        />
      </div>
    </PageContainer>
  );
}
