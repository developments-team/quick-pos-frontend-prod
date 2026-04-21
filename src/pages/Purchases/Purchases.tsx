/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useProvider } from "../../context/Provider";
import { PageContainer } from "../../components/layout/Page";
import { toast } from "../../components/ui/Toast";
import { Package } from "lucide-react";
import { Spinner } from "../../components/ui/Spinner";
import type { Purchase } from "./index";
import type {
  POSCartItem,
  POSAdditionalCost,
  POSTotals,
} from "../../components/pos/types";
import {
  ProductGrid,
  Cart,
  PaymentModal,
  VariantSelectionModal,
} from "../../components/pos";
import { AdditionalCostsModal } from "../../components/pos/AdditionalCostsModal";
import { PaymentTypesEntry } from "../PaymentTypes";
import { CostTypesEntry } from "../CostTypes";
import { useLocation, useNavigate } from "react-router-dom";

const emptyPurchase: Partial<Purchase> = {
  branchId: "",
  ref: "",
  vendorId: "",
  subTotal: 0,
  discountType: "amount",
  discountPercentage: 0,
  discountAmount: 0,
  totalDiscountAmount: 0,
  taxPercentage: 0,
  taxAmount: 0,
  total: 0,
  paid: 0,
  due: 0,
  paymentTypeId: "",
  purchaseDetails: [],
  additionalCosts: [],
  additionalCostsAmount: 0,
  user: "",
  discountItemsType: "percent",
};

export function Purchases() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    createNewPurchase,
    updatePurchase,
    getVendors,
    getProducts,
    getCategories,
    getCostTypes,
    getPaymentTypes,
    getAccountsByGroup,
    getPurchase,
  } = useProvider();

  const isEditMode = location.state?.id && location.pathname.includes("/edit");
  const isReturnMode =
    location.state?.id && location.pathname.includes("/return");
  const navigationState = location.state;
  const purchaseId = navigationState?.id;

  const [formData, setFormData] = useState<Partial<Purchase>>(() => {
    if (isEditMode || isReturnMode) {
      return { ...emptyPurchase };
    }
    const savedData = localStorage.getItem("purchase_cart");
    if (savedData) {
      const parsed = JSON.parse(savedData);
      return {
        ...emptyPurchase,
        additionalCosts: parsed.additionalCosts || [],
        ...(parsed.transactionDetails || {}),
      };
    }
    return { ...emptyPurchase };
  });
  const [cart, setCart] = useState<POSCartItem[]>(() => {
    // Don't load from localStorage if in edit or return mode
    if (isEditMode || isReturnMode) {
      return [];
    }
    const savedData = localStorage.getItem("purchase_cart");
    if (savedData) {
      const parsed = JSON.parse(savedData);
      return parsed.items || [];
    }
    return [];
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [selectedVariantProduct, setSelectedVariantProduct] = useState<
    any | null
  >(null);

  const [showCartMobile, setShowCartMobile] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isAdditionalCostsModalOpen, setIsAdditionalCostsModalOpen] =
    useState(false);
  const [isPaymentTypeModalOpen, setIsPaymentTypeModalOpen] = useState(false);
  const [isCostTypeModalOpen, setIsCostTypeModalOpen] = useState(false);
  const [paidAmount, setPaidAmount] = useState<number>();

  const { data: purchaseData, isLoading: isPurchaseLoading } = useQuery({
    queryKey: ["purchase", purchaseId],
    queryFn: () => getPurchase(purchaseId),
    enabled: !!purchaseId && (isEditMode || isReturnMode),
    select: (res: any) => res?.data || res,
  });

  const initialData = purchaseData || navigationState;

  useEffect(() => {
    if (initialData && (initialData.id || isReturnMode)) {
      // Pre-fill form data
      setFormData((prev) => ({
        ...prev,
        ...initialData,
        branchId: initialData.branchId || prev.branchId,
        vendorId: initialData.vendorId || prev.vendorId,
        ref: isReturnMode ? initialData.ref || "" : initialData.ref || prev.ref,
        subTotal: initialData.subTotal || 0,
        discountType: initialData.discountType || "amount",
        discountPercentage: initialData.discountPercentage || 0,
        discountAmount: initialData.discountAmount || 0,
        totalDiscountAmount: initialData.totalDiscountAmount || 0,
        taxAmount: initialData.taxAmount || 0,
        taxPercentage: initialData.taxPercentage || 0,
        total: initialData.total || 0,
        paid: initialData.paid || 0,
        due: initialData.due || 0,
        paymentTypeId: initialData.paymentTypeId || "",
        additionalCostsAmount: initialData.additionalCostsAmount || 0,
        additionalCosts: initialData.additionalCosts || [],
        discountItemsType: initialData.discountItemsType || "amount",
      }));

      // Pre-fill cart
      if (
        initialData.purchaseDetails &&
        initialData.purchaseDetails.length > 0
      ) {
        const mappedCart: POSCartItem[] = initialData.purchaseDetails.map(
          (detail: any) => ({
            id: crypto.randomUUID(),
            productId: detail.productId,
            productDetailId: detail.productDetailId,
            productName:
              detail.product?.name || detail.productName || "Product",
            productImage: detail.product?.productImage || "",
            purchasePrice: detail.price || detail.purchasePrice || 0,
            salePrice: 0,
            quantity: isReturnMode
              ? detail.quantity > 0
                ? -detail.quantity
                : detail.quantity
              : detail.quantity,
            discountType: detail.discountType || "amount",
            // Helper logic for UI discount value
            discount:
              detail.discountType === "percent"
                ? detail.discountPercentage
                : detail.discountAmount,
            total: detail.total || 0,
            note: "",
            animationKey: 0,
          }),
        );
        setCart(mappedCart);
      }
    }
  }, [initialData, isReturnMode]);

  // Fetch vendors
  const { data: partyOptions = [] } = useQuery({
    queryKey: ["vendors"],
    queryFn: () => getVendors(),
    select: (res: any) => {
      const vendors = Array.isArray(res) ? res : res?.data || [];
      return vendors.map((v: any) => ({ value: v.id, label: v.name }));
    },
  });

  // Fetch categories
  const { data: categoryOptions = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
    select: (res: any) => {
      const categories = Array.isArray(res) ? res : res?.data || [];
      return categories.map((c: any) => ({ value: c.id, label: c.name }));
    },
  });

  // Fetch products
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts(),
    select: (res: any) => (Array.isArray(res) ? res : res?.data || []),
  });

  // Fetch Cost Types
  const { data: costTypes = [] } = useQuery({
    queryKey: ["costTypes"],
    queryFn: () => getCostTypes(),
    select: (res: any) => (Array.isArray(res) ? res : res?.data || []),
  });

  // Fetch Payment Types
  const { data: paymentTypes = [] } = useQuery({
    queryKey: ["paymentTypes"],
    queryFn: () => getPaymentTypes(),
    select: (res: any) => (Array.isArray(res) ? res : res?.data || []),
  });

  // Fetch Accounts
  // const { data: accountOptions = [] } = useQuery({
  //   queryKey: ["chartOfAccounts"],
  //   queryFn: () => getChartOfAccounts(),
  //   select: (res: any) => {
  //     const accounts = Array.isArray(res) ? res : res?.data || [];
  //     return accounts.map((a: any) => ({ value: a.id, label: a.name }));
  //   },
  // });

  const { data: accountOptions = [] } = useQuery({
    queryKey: ["accounts-by-group", "EXPENSE"],
    queryFn: () => getAccountsByGroup("EXPENSE"),
    select: (res: any) => {
      const accounts = Array.isArray(res) ? res : res?.data || [];
      return accounts.map((a: any) => ({
        value: a.id,
        label: `${a.accountNumber} - ${a.accountName}`,
      }));
    },
  });

  // Filter products
  const filteredProducts = useMemo(() => {
    let filtered = products;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p: any) =>
          p.name?.toLowerCase().includes(term) ||
          p.sku?.toLowerCase().includes(term) ||
          p.barcode?.toLowerCase().includes(term),
      );
    }
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((p: any) =>
        selectedCategories.includes(p.categoryId),
      );
    }
    return filtered;
  }, [products, searchTerm, selectedCategories]);

  const calculateTotals = (): POSTotals => {
    const subTotal = cart.reduce((sum, item) => sum + (item.total || 0), 0);
    const tax = formData.taxAmount || 0;

    // Global discount logic
    // We strictly use what's in formData.
    // If type is percent, calculate amount. If amount, use it directly.
    // But `POSTotals` interface expects `discountGlobal` (amount) and `discountPercent`.
    // The UI Cart uses `discountGlobal` and `discountPercent` to display the active state.

    let discountGlobalAmount = 0;
    let discountPercent = 0;

    if (formData.discountType === "percent") {
      discountPercent = formData.discountPercentage || 0;
      discountGlobalAmount = (subTotal * discountPercent) / 100;
    } else {
      discountGlobalAmount = formData.discountAmount || 0;
      // Optionally calculate percent for display?, rarely used in reverse
    }

    const additionalCostsTotal = (formData.additionalCosts || []).reduce(
      (sum: number, item: any) => sum + (item.amount || 0),
      0,
    );

    // Total calculation: subTotal + tax - discount - additionalCosts (Wait, additionalCost is usually Added?)
    // Usually Total = Subtotal - Discount + Tax + AdditionalCosts ?
    // Or Total = SubTotal + Tax - Discount. AdditionalCosts are separate?
    // Looking at previous code: total = subTotal + tax - discountAmount - subtotalDiscount; (Wait)
    // Previous code:
    // const additionalCostsTotal = ...
    // const total = subTotal + tax - discountAmount - subtotalDiscount; (additionalCostsTotal was unused in total??)
    // Actually unused in total line 219.

    // Let's assume Total includes everything the user has to pay.
    // The user JSON has `additionalCostsAmount` separate from `total`?
    // JSON: "total": 0, "paid": 0, "due": 0.
    // Usually for Purchase: Total = (Items Total) - Global Discount + Tax.
    // Additional Costs might be expenses allocated to the purchase but maybe not part of the "Vendor Payment" if they are paid to 3rd parties (shipping etc).
    // Or they might be part of the vendor bill.
    // Given usage in POS (Sales), additional costs are added to total.
    // Let's verify `AdditionalCostsModal` shows `vendorId`. If checking previous code `AdditionalCostsModal` usage:
    // `additionalCosts` items have `vendorId`, `accountId`.
    // This suggests they might be separate separate journal entries.
    // Let's strictly follow: Total = SubTotal - Global Discount + Tax.
    // If the user wants Additional Costs in Total, they'd usually expect it, but if they are to different vendors, they shouldn't be in THIS purchase total?
    // UNLESS the additional cost is "Freight" charged by THIS vendor.
    // Given the payload, let's assume `total` matches what `subTotal` logic implies, typically excluding separate costs unless specified.
    // But commonly `subTotal` - `discount` + `tax`.

    const total = subTotal + tax - discountGlobalAmount;

    return {
      subTotal,
      tax,
      discountGlobal: discountGlobalAmount,
      discountPercent,
      additionalCostsTotal,
      total,
      paid: formData.paid || 0,
      due: total - (formData.paid || 0),
    };
  };

  const totals = calculateTotals();

  // Save cart to localStorage whenever it changes (skip if in edit/return mode)
  useEffect(() => {
    if (!isEditMode && !isReturnMode) {
      const purchaseCartData = {
        items: cart,
        additionalCosts: formData.additionalCosts || [],
        transactionDetails: {
          vendorId: formData.vendorId, // Add vendorId
          taxPercentage: formData.taxPercentage,
          taxAmount: formData.taxAmount,
          discountType: formData.discountType,
          discountPercentage: formData.discountPercentage,
          discountAmount: formData.discountAmount,
          discountItemsType: formData.discountItemsType,
        },
      };
      localStorage.setItem("purchase_cart", JSON.stringify(purchaseCartData));
    }
  }, [
    cart,
    formData.vendorId,
    formData.additionalCosts,
    formData.taxPercentage,
    formData.taxAmount,
    formData.discountType,
    formData.discountPercentage,
    formData.discountAmount,
    formData.discountItemsType,
    isEditMode,
    isReturnMode,
  ]);

  const createMutation = useMutation({
    mutationFn: (data: any) =>
      isEditMode
        ? updatePurchase(initialData.id, data)
        : createNewPurchase(data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      if (data.status !== false) {
        toast.success(
          data.message ||
            (isEditMode
              ? "Purchase updated successfully"
              : "Purchase created successfully"),
        );
        if (isEditMode) {
          navigate("/purchases");
        } else {
          handleReset();
        }
      } else {
        toast.error(data.message);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const isPending = createMutation.isPending;

  const handleOpenPaymentModal = () => {
    if (!formData.vendorId) {
      // toast.error("Please select a vendor");
      // return;
    }
    if (cart.length === 0) {
      toast.error("Add at least one product");
      return;
    }
    // Set default paid amount to total
    setPaidAmount(totals.total);
    setIsPaymentModalOpen(true);
  };

  // Update formData with calculated totals
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      subTotal: totals.subTotal,
      total: totals.total,
      due: totals.due,
      additionalCostsAmount: totals.additionalCostsTotal,
      purchaseDetails: cart.map((item) => {
        // Just keeping internal state roughly in sync, but real logic is in handleSubmit
        const detail: any = {
          productId: item.productId,
          productDetailId: item.productDetailId,
          price: item.purchasePrice,
          quantity: item.quantity,
          discountType: item.discountType,
          total: item.total,
        };
        if (item.discountType === "percent") {
          detail.discountPercentage = item.discount;
          detail.discountAmount = 0;
        } else {
          detail.discountAmount = item.discount;
          detail.discountPercentage = 0;
        }
        return detail;
      }),
    }));
  }, [
    cart,
    formData.taxAmount,
    formData.discountAmount,
    formData.discountPercentage,
    formData.discountType,
    formData.additionalCosts,
  ]);

  const handleSubmit = () => {
    // Construct payload strictly according to JSON structure

    // Calculate total discount from items
    const totalItemDiscount = cart.reduce((acc, item) => {
      const itemPrice = item.purchasePrice * item.quantity;
      const currentTotal = item.total || 0;
      return acc + (itemPrice - currentTotal);
    }, 0);

    const discountGlobalAmount = totals.discountGlobal;
    const totalDiscountAmount = discountGlobalAmount + totalItemDiscount;

    const payload: any = {
      branchId: JSON.parse(localStorage.getItem("user_data") || "{}")?.branches
        ?.id,
      vendorId: formData.vendorId,
      subTotal: totals.subTotal,

      taxPercentage: formData.taxPercentage || 0,
      taxAmount: totals.tax, // matches formData.taxAmount

      discountType: formData.discountType,
      discountPercentage: formData.discountPercentage || 0,
      discountAmount: formData.discountAmount || 0, // Should be the global discount amount set by user

      totalDiscountAmount: totalDiscountAmount,

      total: totals.total,
      paid: paidAmount || 0,
      due: Math.max(0, totals.total - (paidAmount || 0)),

      paymentTypeId:
        paymentTypes.find((p: any) => p.name === formData.paymentTypeId)?.id ||
        formData.paymentTypeId ||
        "",
      // Note: PaymentModal updates formData.paymentTypeId (previously paymentType)

      purchaseDetails: cart.map((item) => {
        const detail: any = {
          // id: "string", // generated backend
          productId: item.productId,
          productDetailId: item.productDetailId,
          quantity: item.quantity,
          price: item.purchasePrice,
          discountType: item.discountType,
          discountPercentage: 0,
          discountAmount: 0,
          total: item.total,
        };

        if (item.discountType === "percent") {
          detail.discountPercentage = item.discount;
          detail.discountAmount = 0;
        } else {
          detail.discountAmount = item.discount;
          detail.discountPercentage = 0;
        }

        return detail;
      }),

      additionalCosts: (formData.additionalCosts || []).map((cost) => ({
        // id: 'string', // generated backend
        costTypeId: cost.costTypeId,
        vendorId: cost.vendorId || formData.vendorId, // Default to main vendor if not specified? Or required?
        accountId: cost.accountId || "",
        amount: cost.amount,
        note: cost.note || "",
      })),

      additionalCostsAmount: totals.additionalCostsTotal,

      // Determine discountItemsType from cart items - use first item's type if all uniform
      discountItemsType:
        cart.length > 0 &&
        cart.every((item) => item.discountType === cart[0].discountType)
          ? cart[0].discountType
          : "amount",
    };

    console.log(payload);
    createMutation.mutate(payload);
    setIsPaymentModalOpen(false);
  };

  const handleAddCost = (cost?: Partial<POSAdditionalCost>) => {
    setFormData((prev) => ({
      ...prev,
      additionalCosts: [
        ...(prev.additionalCosts || []),
        {
          costTypeId: cost?.costTypeId || "",
          vendorId: cost?.vendorId || "",
          accountId: cost?.accountId || "",
          amount: cost?.amount || 0,
          note: cost?.note || "",
          id: crypto.randomUUID(), // Temp ID for UI key
        },
      ],
    }));
  };

  const handleRemoveCost = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      additionalCosts: (prev.additionalCosts || []).filter(
        (_, i) => i !== index,
      ),
    }));
  };

  const handleCostChange = (index: number, field: string, value: any) => {
    setFormData((prev) => {
      const newCosts = [...(prev.additionalCosts || [])];
      newCosts[index] = { ...newCosts[index], [field]: value };
      return { ...prev, additionalCosts: newCosts };
    });
  };

  const handleReset = () => {
    setFormData({ ...emptyPurchase });
    setCart([]);
    setExpandedItemId(null);
    localStorage.removeItem("purchase_cart");
  };

  // Add product to cart
  const addToCart = (product: any) => {
    if (
      product.productDetails &&
      product.productDetails.length > 1 &&
      product.id === product.productDetails[0].productId
    ) {
      setSelectedVariantProduct(product);
      return;
    }

    const existingIndex = cart.findIndex(
      (item) =>
        item.productId === product.id &&
        item.productDetailId === (product.productDetails?.[0]?.id || ""),
    );

    if (existingIndex >= 0) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += 1;

      // Recalc total
      const price = newCart[existingIndex].purchasePrice;
      const qty = newCart[existingIndex].quantity;
      const discount = newCart[existingIndex].discount;
      const discountType = newCart[existingIndex].discountType;

      let itemTotal = price * qty;
      if (discountType === "percent") {
        itemTotal = itemTotal * (1 - discount / 100);
      } else {
        itemTotal = itemTotal - discount;
      }
      newCart[existingIndex].total = Math.max(0, itemTotal);

      newCart[existingIndex].animationKey =
        (newCart[existingIndex].animationKey || 0) + 1;
      setCart(newCart);
    } else {
      const detail = product.productDetails?.[0];

      // Generate variant string if exists
      let variantString = "";
      if (detail?.productVariants?.length > 0) {
        const variants = detail.productVariants.filter((v: any) => v.variantId);
        if (variants.length > 0) {
          variantString = variants.map((v: any) => v.variantValue).join(", ");
        }
      }

      const newItem: POSCartItem = {
        id: crypto.randomUUID(),
        productId: product.id,
        productDetailId: detail?.id || "",
        productName: product.name,
        variantString: variantString || undefined,
        productImage: product.productImage || "",
        purchasePrice: detail?.purchasePrice || 0,
        salePrice: detail?.salePrice || 0,
        quantity: 1,
        discountType: "amount",
        discount: 0,
        total: detail?.purchasePrice || 0,
        note: "",
        animationKey: 1,
      };
      setCart([...cart, newItem]);
    }
  };

  const updateCartItem = (
    itemId: string,
    field: keyof POSCartItem,
    value: any,
  ) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === itemId) {
          const updated = { ...item, [field]: value };

          // Recalculate total if relevant fields change
          if (
            field === "quantity" ||
            field === "purchasePrice" ||
            field === "discount" ||
            field === "discountType"
          ) {
            const price = updated.purchasePrice;
            const quantity = updated.quantity;
            const discount = updated.discount || 0;
            const discountType = updated.discountType;

            let itemTotal = price * quantity;
            if (discountType === "percent") {
              itemTotal = itemTotal * (1 - discount / 100);
            } else {
              itemTotal = itemTotal - discount;
            }
            updated.total = Math.max(0, itemTotal);
          }
          return updated;
        }
        return item;
      }),
    );
  };

  const updateCartItemQuantity = (itemId: string, delta: number) => {
    const item = cart.find((i) => i.id === itemId);
    if (item) {
      const newQty = Math.max(1, item.quantity + delta);
      updateCartItem(itemId, "quantity", newQty);
    }
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter((item) => item.id !== itemId));
    if (expandedItemId === itemId) {
      setExpandedItemId(null);
    }
  };

  const toggleItemExpand = (itemId: string) => {
    setExpandedItemId((prev) => (prev === itemId ? null : itemId));
  };

  if (isPurchaseLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <PageContainer pageType="pos" className="h-full">
      <div className="flex h-full gap-3 overflow-hidden">
        {/* Left Column - Products */}
        <ProductGrid
          products={filteredProducts}
          cart={cart}
          onAddToCart={addToCart}
          categoryOptions={categoryOptions}
          isLoading={productsLoading}
          priceMode="purchase"
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategories={selectedCategories}
          onCategoryChange={setSelectedCategories}
        />

        {/* Right Column - Cart and Vendor */}
        <Cart
          cart={cart}
          party={formData.vendorId || ""}
          onPartyChange={(value) =>
            setFormData({ ...formData, vendorId: value })
          }
          partyOptions={partyOptions}
          partyType="vendor"
          expandedItemId={expandedItemId}
          onToggleExpand={toggleItemExpand}
          onQuantityChange={updateCartItemQuantity}
          onPriceChange={(itemId, price) =>
            updateCartItem(itemId, "purchasePrice", price)
          }
          onDiscountChange={(itemId, discount) =>
            updateCartItem(itemId, "discount", discount)
          }
          onDiscountTypeChange={(itemId, type) =>
            updateCartItem(itemId, "discountType", type)
          }
          onNoteChange={(itemId, note) => updateCartItem(itemId, "note", note)}
          onRemove={removeFromCart}
          onPay={handleOpenPaymentModal}
          onReset={handleReset}
          totals={totals}
          priceMode="purchase"
          isPending={isPending}
          showCartMobile={showCartMobile}
          onCloseMobile={() => setShowCartMobile(false)}
          onDiscountGlobalPercentChange={(value: number) =>
            setFormData((prev) => ({
              ...prev,
              discountPercentage: value,
              discountAmount: 0,
            }))
          }
          onDiscountGlobalAmountChange={(value: number) =>
            setFormData((prev) => ({
              ...prev,
              discountAmount: value,
              discountPercentage: 0,
            }))
          }
          globalDiscountType={formData.discountType as "amount" | "percent"}
          onGlobalDiscountTypeChange={(type) =>
            setFormData((prev) => ({ ...prev, discountType: type }))
          }
          onAddCost={() => setIsAdditionalCostsModalOpen(true)}
          onApplyDiscountToAll={(value, type) => {
            setFormData((prev) => ({ ...prev, discountItemsType: type }));
            setCart((prevCart) =>
              prevCart.map((item) => {
                let itemTotal = item.purchasePrice * item.quantity;
                if (type === "percent") {
                  itemTotal = itemTotal * (1 - value / 100);
                } else {
                  itemTotal = itemTotal - value;
                }
                return {
                  ...item,
                  discount: value,
                  discountType: type,
                  total: Math.max(0, itemTotal),
                };
              }),
            );
          }}
          discountItemsType={formData.discountItemsType as "amount" | "percent"}
        />

        {/* Mobile Cart Toggle Button */}
        <button
          className="lg:hidden fixed bottom-4 right-4 z-40 bg-(--primary) text-white p-4 rounded-full shadow-lg hover:bg-(--primary)/90 transition-colors flex items-center justify-center"
          onClick={() => setShowCartMobile(true)}
        >
          <div className="relative">
            <Package size={24} />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-(--bg-app)">
                {cart.reduce((acc, item) => acc + item.quantity, 0)}
              </span>
            )}
          </div>
        </button>

        {/* Payment Modal */}
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          onSubmit={handleSubmit}
          cart={cart}
          totals={totals}
          paymentType={
            formData.paymentTypeId ||
            paymentTypes.find((p: any) => p.id === formData.paymentTypeId)
              ?.name ||
            "Cash"
          }
          onPaymentTypeChange={(type) =>
            // Map name to ID? Or just store what comes back.
            // PaymentModal generally returns the value selected.
            // But we need paymentTypeId.
            // If PaymentModal returns name, we find ID.
            {
              const pt = paymentTypes.find((p: any) => p.name === type);
              setFormData((prev) => ({
                ...prev,
                paymentTypeId: pt?.id || type,
              }));
            }
          }
          isPending={isPending}
          mode="purchase"
          additionalCosts={
            (formData.additionalCosts || []).map((cost) => ({
              ...cost,
              name:
                costTypes.find((ct: any) => ct.id === cost.costTypeId)?.name ||
                "Cost",
            })) as POSAdditionalCost[]
          }
          paidAmount={paidAmount}
          onPaidAmountChange={setPaidAmount}
          balance={paidAmount ? paidAmount - totals.total : -totals.total}
          paymentTypes={paymentTypes}
          onAddPaymentType={() => setIsPaymentTypeModalOpen(true)}
          vendorName={
            partyOptions.find((p: any) => p.value === formData.vendorId)
              ?.label || ""
          }
        />
        <AdditionalCostsModal
          isOpen={isAdditionalCostsModalOpen}
          onClose={() => setIsAdditionalCostsModalOpen(false)}
          additionalCosts={formData.additionalCosts as POSAdditionalCost[]}
          onAddCost={handleAddCost}
          onRemoveCost={handleRemoveCost}
          onCostChange={handleCostChange}
          costTypes={costTypes}
          onAddCostType={() => setIsCostTypeModalOpen(true)}
          vendorOptions={partyOptions}
          accountOptions={accountOptions}
          onClear={() =>
            setFormData((prev) => ({ ...prev, additionalCosts: [] }))
          }
        />

        <PaymentTypesEntry
          isOpen={isPaymentTypeModalOpen}
          onClose={() => setIsPaymentTypeModalOpen(false)}
        />

        <CostTypesEntry
          isOpen={isCostTypeModalOpen}
          onClose={() => setIsCostTypeModalOpen(false)}
        />

        {/* Variant Selection Modal */}
        <VariantSelectionModal
          isOpen={!!selectedVariantProduct}
          onClose={() => setSelectedVariantProduct(null)}
          product={selectedVariantProduct}
          onSelectVariant={(variantProduct) => addToCart(variantProduct)}
          priceMode="purchase"
          cart={cart}
        />
      </div>
    </PageContainer>
  );
}
