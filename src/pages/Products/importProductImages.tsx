/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { PageContainer, PageHeader } from "../../components/layout/Page";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useProvider } from "../../context/Provider";
import { toast } from "../../components/ui/Toast";
import { Upload, ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MultiImageChooser } from "../../components/ui/MultiImageChooser";

interface ImageFile {
  id: string;
  file: File;
  sku: string;
  preview: string;
  status: "pending" | "valid" | "invalid";
}

export function ImportProductImages() {
  const navigate = useNavigate();
  const [files, setFiles] = useState<ImageFile[]>([]);
  const { uploadProductsImages, checkProductSKUs } = useProvider();
  const queryClient = useQueryClient();

  const checkSKUsMutation = useMutation({
    mutationFn: (skus: { sku: string }[]) => checkProductSKUs(skus),
    onSuccess: (response: any) => {
      // API returns: { status: true, message: "...", data: [ { sku: "...", exists: true }, ... ] }
      const responseData = response.data || [];

      const validSKUs = new Set(
        Array.isArray(responseData)
          ? responseData
              .filter((item: any) => item.exists === true)
              .map((item: any) => item.sku)
          : [],
      );

      setFiles((prev) =>
        prev.map((f) => ({
          ...f,
          status: validSKUs.has(f.sku) ? "valid" : "invalid",
        })),
      );

      const validCount = validSKUs.size;
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

  const handleFilesChange = (newFiles: File[]) => {
    const processedFiles: ImageFile[] = newFiles.map((file) => {
      const fileName = file.name;
      const sku = fileName.substring(0, fileName.lastIndexOf(".")) || fileName;
      return {
        id: Math.random().toString(36).substring(7),
        file,
        sku,
        preview: URL.createObjectURL(file), // Note: MultiImageChooser also creates object URLs, but we need one for DataTable if we keep it.
        // Actually, if we use MultiImageChooser, we might not need DataTable preview column, or we can just reuse the one we create here.
        status: "pending",
      };
    });

    setFiles(processedFiles);

    // Extract SKUs to check
    const skusToCheck = processedFiles.map((f) => ({ sku: f.sku }));
    if (skusToCheck.length > 0) {
      checkSKUsMutation.mutate(skusToCheck);
    }
  };

  const handleUpload = async () => {
    const validFiles = files.filter((f) => f.status === "valid");
    if (validFiles.length === 0) return;

    try {
      const fd = new FormData();

      validFiles.forEach((f, index) => {
        fd.append(`products[${index}][sku]`, f.sku);
        fd.append(`products[${index}][productImage]`, f.file);
      });

      fd.append(
        "user",
        JSON.parse(localStorage.getItem("user_data") || "{}")?.id,
      );

      uploadMutation.mutate(fd);
    } catch (err: any) {
      toast.error("Error preparing files: " + err.message);
    }
  };

  const getFileStatus = (file: File) => {
    const found = files.find((f) => f.file === file);
    if (!found) return null;
    return { status: found.status };
  };

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
        <div className="flex justify-between items-center p-4 rounded-lg border border-(--border)">
          <div>
            <h3 className="text-sm font-medium">Status</h3>
            <p className="text-xs text-(--text-muted)">
              {files.length} selected ·{" "}
              {files.filter((f) => f.status === "valid").length} valid ·{" "}
              {files.filter((f) => f.status === "invalid").length} invalid
            </p>
          </div>
          <div className="flex gap-2">
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
                  Upload Valid Images
                </>
              )}
            </Button>
          </div>
        </div>

        <MultiImageChooser
          onChange={handleFilesChange}
          getFileStatus={getFileStatus}
          className="w-full"
        />
      </div>
    </PageContainer>
  );
}
