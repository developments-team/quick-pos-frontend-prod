/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from "react";
import { Button } from "../../components/ui/Button";
import { DataTable, type Column } from "../../components/ui/DataTable";
import { PageContainer, PageHeader } from "../../components/layout/Page";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useProvider } from "../../context/Provider";
import { toast } from "../../components/ui/Toast";
import { Upload, ArrowLeft, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";

interface ImageFile {
  id: string;
  file: File;
  sku: string;
  preview: string;
  status: "pending" | "valid" | "invalid";
  base64?: string;
}

export function ImportProductImages() {
  const navigate = useNavigate();
  const [files, setFiles] = useState<ImageFile[]>([]);
  const { uploadProductsImages, checkProductSKUs } = useProvider();
  const queryClient = useQueryClient();

  const checkSKUsMutation = useMutation({
    mutationFn: (skus: { sku: string }[]) => checkProductSKUs(skus),
    onSuccess: (data: any) => {
      // Assuming data returns a list of valid SKUs or similar.
      // Adjusting logic based on expected API response.
      // If API returns list of valid objects or SKUs:
      const validSKUs = new Set(
        Array.isArray(data) ? data.map((item: any) => item.sku || item) : [],
      );

      setFiles((prev) =>
        prev.map((f) => ({
          ...f,
          status: validSKUs.has(f.sku) ? "valid" : "invalid",
        })),
      );

      const validCount = Array.isArray(data) ? data.length : 0;
      if (validCount > 0) {
        toast.success(`Found ${validCount} valid SKUs.`);
      } else {
        toast.error("No valid SKUs found among selected files.");
      }
    },
    onError: (error: Error) => {
      toast.error("Failed to check SKUs: " + error.message);
    },
  });

  const uploadMutation = useMutation({
    mutationFn: (payload: any) => uploadProductsImages(payload),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      if (data.status !== false) {
        toast.success(data.message || "Images uploaded successfully");
        navigate("/products");
      } else {
        toast.error(data.message || "Failed to upload images");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to upload images");
    },
  });

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const newFiles: ImageFile[] = acceptedFiles.map((file) => {
        const fileName = file.name;
        const sku =
          fileName.substring(0, fileName.lastIndexOf(".")) || fileName;
        return {
          id: Math.random().toString(36).substring(7),
          file,
          sku,
          preview: URL.createObjectURL(file),
          status: "pending",
        };
      });

      setFiles(newFiles);

      // Extract SKUs to check
      const skusToCheck = newFiles.map((f) => ({ sku: f.sku }));
      if (skusToCheck.length > 0) {
        checkSKUsMutation.mutate(skusToCheck);
      }
    },
    [checkSKUsMutation],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
  });

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleUpload = async () => {
    const validFiles = files.filter((f) => f.status === "valid");
    if (validFiles.length === 0) return;

    try {
      const productsData = await Promise.all(
        validFiles.map(async (f) => ({
          sku: f.sku,
          productImage: await convertToBase64(f.file),
        })),
      );

      const payload = {
        products: productsData,
      };

      uploadMutation.mutate(payload);
    } catch (err: any) {
      toast.error("Error preparing files: " + err.message);
    }
  };

  const columns: Column<ImageFile>[] = [
    {
      header: "Preview",
      accessorKey: "preview",
      cell: (item: ImageFile) => (
        <div className="h-12 w-12 rounded overflow-hidden border border-gray-200">
          <img
            src={item.preview}
            alt={item.sku}
            className="h-full w-full object-cover"
          />
        </div>
      ),
    },
    {
      header: "Filename",
      accessorKey: "file",
      cell: (item: ImageFile) => <span>{item.file.name}</span>,
    },
    {
      header: "SKU Extracted",
      accessorKey: "sku",
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (item: ImageFile) => {
        if (checkSKUsMutation.isPending && item.status === "pending") {
          return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
        }
        if (item.status === "valid") {
          return (
            <div className="flex items-center text-green-600 gap-1">
              <CheckCircle size={16} />
              <span>Valid</span>
            </div>
          );
        }
        if (item.status === "invalid") {
          return (
            <div className="flex items-center text-red-500 gap-1">
              <XCircle size={16} />
              <span>SKU Not Found</span>
            </div>
          );
        }
        return <span className="text-gray-400">Pending</span>;
      },
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Import Product Images"
        action={
          <Button outline onClick={() => navigate("/products")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />

      <div className="space-y-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
            isDragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-blue-400"
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-700">
            {isDragActive
              ? "Drop the images here..."
              : "Drag 'n' drop images here, or click to select files"}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Files should be named with the Product SKU (e.g., "DOC001.jpg")
          </p>
        </div>

        {files.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">
                Selected Files ({files.length})
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setFiles([])}
                  disabled={uploadMutation.isPending}
                >
                  Clear All
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={
                    uploadMutation.isPending ||
                    files.filter((f) => f.status === "valid").length === 0
                  }
                >
                  {uploadMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload {
                        files.filter((f) => f.status === "valid").length
                      }{" "}
                      Valid Images
                    </>
                  )}
                </Button>
              </div>
            </div>

            <DataTable
              columns={columns}
              data={files}
              isLoading={
                checkSKUsMutation.isPending &&
                files.length > 0 &&
                files[0].status === "pending"
              }
            />
          </div>
        )}
      </div>
    </PageContainer>
  );
}
