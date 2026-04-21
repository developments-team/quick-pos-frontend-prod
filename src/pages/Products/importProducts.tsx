/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import XLSX from "xlsx-js-style";

import { Button } from "../../components/ui/Button";
import { DataTable, type Column } from "../../components/ui/DataTable";
import { FileChooser } from "../../components/ui/FileChooser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useProvider } from "../../context/Provider";
import { toast } from "../../components/ui/Toast";
import { Download, Upload, AlertCircle, ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { PageContainer, PageHeader } from "../../components/layout/Page";

import { useNavigate } from "react-router-dom";

export function ImportProducts() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [previewColumns, setPreviewColumns] = useState<Column<any>[]>([]);
  const { uploadProducts } = useProvider();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: (data: any) => uploadProducts(data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      if (data.status !== false) {
        toast.success(data.message || "Products uploaded successfully");
        navigate("/products");
        setFile(null);
      } else {
        toast.error(data.message || "Failed to upload products");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to upload products");
    },
  });

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        No: 1,
        Name: "Test Standard Product",
        Category: "TEST",
        Brand: "Gucci",
        Group: "midium",
        PurchaseUnit: "piece",
        SaleUnit: "piece",
        Rate: 1,
        ProductType: "standard",
        VariantName: "",
        VariantValue: "",
        PurchasePrice: 697,
        SalePrice: 700,
        SKU: "17290",
        Barcode: 17290,
        ReOrder: 10,
      },
      {
        No: 2,
        Name: "Test Variant Product",
        Category: "TEST",
        Brand: "Gucci",
        Group: "midium",
        PurchaseUnit: "piece",
        SaleUnit: "piece",
        Rate: 1,
        ProductType: "variant",
        VariantName: "color,size",
        VariantValue: "green,M",
        PurchasePrice: 250,
        SalePrice: 270,
        SKU: "17291",
        Barcode: 17291,
        ReOrder: 10,
      },
      {
        No: "",
        Name: "",
        Category: "",
        Brand: "",
        Group: "",
        PurchaseUnit: "",
        SaleUnit: "",
        Rate: "",
        ProductType: "",
        VariantName: "color,size",
        VariantValue: "green,L",
        PurchasePrice: 251,
        SalePrice: 271,
        SKU: "17292",
        Barcode: 17292,
        ReOrder: 10,
      },
      {
        No: "",
        Name: "",
        Category: "",
        Brand: "",
        Group: "",
        PurchaseUnit: "",
        SaleUnit: "",
        Rate: "",
        ProductType: "",
        VariantName: "color,size",
        VariantValue: "green,XL",
        PurchasePrice: 252,
        SalePrice: 272,
        SKU: "17293",
        Barcode: 17293,
        ReOrder: 10,
      },
      {
        No: "",
        Name: "",
        Category: "",
        Brand: "",
        Group: "",
        PurchaseUnit: "",
        SaleUnit: "",
        Rate: "",
        ProductType: "",
        VariantName: "color,size",
        VariantValue: "green,XXL",
        PurchasePrice: 253,
        SalePrice: 273,
        SKU: "17294",
        Barcode: 17294,
        ReOrder: 10,
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);

    // Auto-fit columns
    const objectMaxLength: number[] = [];
    const keys = Object.keys(templateData[0]);

    // Initialize with header lengths
    keys.forEach((key) => {
      objectMaxLength.push(key.length);
    });

    // Iterate data to find max length
    templateData.forEach((row: any) => {
      const value = Object.values(row);
      value.forEach((val: any, i) => {
        const len = val ? String(val).length : 0;
        if (len > objectMaxLength[i]) {
          objectMaxLength[i] = len;
        }
      });
    });

    // Set column widths (with some padding)
    worksheet["!cols"] = objectMaxLength.map((w) => ({ width: w + 2 }));

    // Apply Styles to Header Row
    // range of cells A1 : <LastColumn>1
    const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1:A1");
    // Headers are in the first row (index 0)
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!worksheet[address]) continue;

      worksheet[address].s = {
        font: {
          bold: true,
          color: { rgb: "FFFFFF" },
        },
        fill: {
          fgColor: { rgb: "4F81BD" }, // Excel Blue
        },
        alignment: {
          horizontal: "center",
          vertical: "center",
        },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } },
        },
      };
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products Template");
    XLSX.writeFile(workbook, "products_template.xlsx");
  };

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        if (jsonData.length > 0) {
          const processedData: any[] = [];
          let currentParent: any = null;

          jsonData.forEach((row: any) => {
            // Check if row has 'No' - treating it as a new parent product
            // Adjust condition based on how purely empty cells are read (undefined or empty string)
            if (row.No !== undefined && row.No !== null && row.No !== "") {
              currentParent = { ...row, subRows: [] };
              processedData.push(currentParent);
            } else if (currentParent) {
              // It's a variant/sub-row
              currentParent.subRows.push(row);
            }
          });

          setPreviewData(processedData);

          // Generate columns from first row of original data to ensure all keys are present
          const firstRow = jsonData[0] as object;
          const cols: Column<any>[] = Object.keys(firstRow).map((key) => ({
            header: key,
            accessorKey: key,
            searchable: true,
          }));
          setPreviewColumns(cols);
        }
      };
      reader.readAsBinaryString(file);
    } else {
      if (previewData.length > 0) setPreviewData([]);
      if (previewColumns.length > 0) setPreviewColumns([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  const handleImport = () => {
    if (!previewData.length) return;

    const products = previewData.map((parent: any) => {
      // Helper to process a row into a detail object
      const processRowToDetail = (row: any) => {
        const variants: any[] = [];

        if (row.VariantName && row.VariantValue) {
          const names = String(row.VariantName).split(",");
          const values = String(row.VariantValue).split(",");

          names.forEach((name, index) => {
            if (values[index]) {
              variants.push({
                variantName: name.trim(),
                variantValue: values[index].trim(),
              });
            }
          });
        }

        return {
          purchasePrice: row.PurchasePrice ? String(row.PurchasePrice) : "0",
          salePrice: row.SalePrice ? String(row.SalePrice) : "0",
          sku: row.SKU ? String(row.SKU) : "",
          barcode: row.Barcode ? String(row.Barcode) : "",
          reOrder: row.ReOrder ? String(row.ReOrder) : "0",
          productVariants: variants,
        };
      };

      const productDetails = [];

      // Add parent's own detail
      productDetails.push(processRowToDetail(parent));

      // Add sub-rows
      if (parent.subRows && parent.subRows.length > 0) {
        parent.subRows.forEach((subRow: any) => {
          productDetails.push(processRowToDetail(subRow));
        });
      }

      return {
        no: parent.No ? String(parent.No) : "",
        name: parent.Name || "",
        category: parent.Category || "",
        brand: parent.Brand || "",
        group: parent.Group || "",
        purchaseUnit: parent.PurchaseUnit || "",
        saleUnit: parent.SaleUnit || "",
        rate: parent.Rate ? String(parent.Rate) : "1",
        productType: parent.ProductType || "standard",
        productDetails: productDetails,
      };
    });

    const payload = {
      products: products,
    };

    uploadMutation.mutate(payload);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Import Products"
        action={
          <Button outline onClick={() => navigate("/products")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <h3 className="text-sm font-medium">Step 1: Download Template</h3>
          <p className="text-sm text-(--text-secondary)">
            Download the Excel template to ensure your data is formatted
            correctly.
          </p>
          <Button
            onClick={handleDownloadTemplate}
            className="w-full justify-center"
            outline
          >
            <Download className="mr-2 h-4 w-4" />
            Download Excel Template
          </Button>
        </div>

        <div className="flex flex-col gap-1.5">
          <h3 className="text-sm font-medium">Step 2: Upload Excel File</h3>
          <p className="text-sm text-(--text-secondary)">
            Upload the filled Excel file to import your products.
          </p>
          <FileChooser
            accept=".xlsx, .xls"
            onChange={setFile}
            label="Choose Excel file"
          />

          {uploadMutation.isError && (
            <div className="text-sm text-red-500 bg-red-50 p-2 rounded flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{uploadMutation.error?.message || "Upload failed"}</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="ghost" onClick={() => navigate("/products")}>
          Cancel
        </Button>
        <Button
          onClick={handleImport}
          disabled={!file || uploadMutation.isPending}
        >
          <Upload className="mr-2 h-4 w-4" />
          {uploadMutation.isPending ? "Importing..." : "Import Products"}
        </Button>
      </div>

      {previewData.length > 0 && (
        <>
          <h3 className="text-sm font-medium">Preview</h3>
          <DataTable
            columns={previewColumns}
            data={previewData}
            isLoading={false}
          />
        </>
      )}
    </PageContainer>
  );
}
