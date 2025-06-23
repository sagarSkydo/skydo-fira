import { useCallback, useState, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, CheckCircle, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { PaymentMethod } from "@/services/firaApi";

interface FileUploadProps {
  onFileUpload: (file: File, paymentMethod: PaymentMethod) => void;
}

export const FileUpload = ({ onFileUpload }: FileUploadProps) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      handleFile(file);
    }
  }, []);

  const handleFile = (file: File) => {
    // Validate file type
    const validTypes = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'image/jpg'
    ];
    
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or image file (PNG, JPG, JPEG)",
        variant: "destructive",
      });
      return;
    }

    setUploadedFile(file);

    // Create preview URL for images
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg']
    },
    multiple: false,
    noClick: true // Disable click on dropzone since we're using our own button
  });

  const handleAnalyze = () => {
    if (uploadedFile && acceptedTerms && paymentMethod) {
      onFileUpload(uploadedFile, paymentMethod);
    }
  };

  const canAnalyze = uploadedFile && acceptedTerms && paymentMethod;

  // Cleanup preview URL when component unmounts
  const cleanup = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  }, [previewUrl]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-2xl mx-auto"
    >
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : uploadedFile 
              ? 'border-green-500 bg-green-50'
              : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
        }`}
      >
        <input 
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept=".pdf,.png,.jpg,.jpeg"
          className="hidden"
        />
        <div className="space-y-4">
          <div className="flex justify-center">
            {isDragActive ? (
              <Upload className="w-12 h-12 text-blue-500" />
            ) : uploadedFile ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="space-y-4"
              >
                {previewUrl ? (
                  <div className="relative w-32 h-32 mx-auto">
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="w-full h-full object-contain rounded-lg border border-slate-200"
                    />
                  </div>
                ) : (
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                )}
                <div className="flex items-center justify-center space-x-3">
                  {previewUrl ? (
                    <ImageIcon className="w-6 h-6 text-green-600" />
                  ) : (
                    <FileText className="w-6 h-6 text-green-600" />
                  )}
                  <span className="text-lg font-medium text-green-700">
                    {uploadedFile.name}
                  </span>
                </div>
                <p className="text-sm text-green-600">
                  File uploaded successfully! Ready to analyze.
                </p>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="w-12 h-12 text-slate-400" />
                <p className="mt-2 text-sm text-slate-500">
                  Drag & drop your FIRA document here
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Supported formats: PDF, PNG, JPG, JPEG
                </p>
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Select File
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {uploadedFile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 space-y-6"
        >
          {/* Payment Method Dropdown */}
          <div className="space-y-2">
            <label htmlFor="payment-method" className="block text-sm font-medium text-slate-700">
              Payment Method
            </label>
            <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-slate-200 shadow-lg z-50">
                <SelectItem value={PaymentMethod.BANK}>Bank</SelectItem>
                <SelectItem value={PaymentMethod.PAYPAL}>PayPal</SelectItem>
                <SelectItem value={PaymentMethod.PAYONEER}>Payoneer</SelectItem>
                <SelectItem value={PaymentMethod.WISE}>Wise</SelectItem>
                <SelectItem value={PaymentMethod.OTHERS}>Others</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Terms & Conditions Checkbox */}
          <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <Checkbox
              id="terms"
              checked={acceptedTerms}
              onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
              className="mt-1"
            />
            <label htmlFor="terms" className="text-sm text-slate-600 cursor-pointer">
              I agree to the{" "}
              <a 
                href="#" 
                className="text-blue-600 hover:text-blue-800 underline"
                onClick={(e) => e.preventDefault()}
              >
                Terms & Conditions
              </a>{" "}
              and{" "}
              <a 
                href="#" 
                className="text-blue-600 hover:text-blue-800 underline"
                onClick={(e) => e.preventDefault()}
              >
                Privacy Policy
              </a>. 
              I understand that my file will be processed securely and used only for analysis purposes.
            </label>
          </div>

          <div className="text-center">
            <Button 
              onClick={handleAnalyze}
              disabled={!canAnalyze}
              size="lg"
              className={`px-8 py-3 text-lg font-semibold rounded-xl shadow-lg transition-all duration-200 ${
                canAnalyze
                  ? 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-xl'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Analyze Document
            </Button>
            {uploadedFile && (!acceptedTerms || !paymentMethod) && (
              <p className="text-sm text-slate-500 mt-2">
                {!paymentMethod && !acceptedTerms 
                  ? "Please select a payment method and accept the terms & conditions to continue"
                  : !paymentMethod 
                    ? "Please select a payment method to continue"
                    : "Please accept the terms & conditions to continue"
                }
              </p>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
