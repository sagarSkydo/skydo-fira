import { useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { ComparisonResults } from "@/components/ComparisonResults";
import { AnimatedHeaderText } from "@/components/AnimatedHeaderText";
import { LoadingStages } from "@/components/LoadingStages";
import { motion } from "framer-motion";
import { uploadAndProcessFira, FiraProcessingResult, PaymentMethod } from "@/services/firaApi";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (file: File, paymentMethod: PaymentMethod) => {
    setUploadedFile(file);
    setIsAnalyzing(true);

    try {
      console.log('Starting file upload process...');
      const result: FiraProcessingResult = await uploadAndProcessFira(file, paymentMethod);
      console.log('Received API response:', result);
      
      if (!result.success) {
        const errorMessage = result.errors?.length > 0 
          ? result.errors.join(', ') 
          : result.message || "Failed to process FIRA document";
        throw new Error(errorMessage);
      }

      if (!result.firaData) {
        throw new Error("No data received from server");
      }

      const { firaData } = result;

      // Calculate effective costs
      // Current Provider: (Original INR Amount - Final INR Amount) / Original INR Amount * 100
      const currentProviderEffectiveCost = Number(
        (((firaData.inrAmount - firaData.finalInrAmount) / firaData.inrAmount) * 100).toFixed(2)
      );

      // Skydo: (Original Amount * Skydo FX Rate - Final Skydo INR Amount) / (Original Amount * Skydo FX Rate) * 100
      const skydoOriginalInrAmount = firaData.amount * firaData.fxRateSkydo;
      const skydoEffectiveCost = Number(
        (((skydoOriginalInrAmount - firaData.finalInrAmountSkydo) / skydoOriginalInrAmount) * 100).toFixed(2)
      );

      // Transform API data to match our component format
      const transformedData = {
        currentProvider: {
          name: "Current Provider",
          paymentAmount: Number(firaData.inrAmount.toFixed(2)),
          charges: [
            {
              type: "FX Rate",
              amount: Number(firaData.calculatedExchangeRate.toFixed(4)),
              isPercentage: false
            },
            {
              type: "Wire Fee (INR)",
              amount: Number(firaData.platformWireFee.toFixed(2))
            },
            {
              type: "FIRA Fee (INR)",
              amount: Number(firaData.platformFiraFee.toFixed(2))
            },
            {
              type: "Transaction Fee (INR)",
              amount: Number(firaData.platformTransactionFee.toFixed(2))
            }
          ],
          totalOnTransaction: Number(
            (firaData.platformWireFee + firaData.platformFiraFee + firaData.platformTransactionFee).toFixed(2)
          ),
          effectiveCost: currentProviderEffectiveCost
        },
        skydo: {
          name: "Skydo",
          paymentAmount: Number(skydoOriginalInrAmount.toFixed(2)),
          charges: [
            {
              type: "FX Rate",
              amount: Number(firaData.fxRateSkydo.toFixed(4)),
              isPercentage: false
            },
            {
              type: "Wire Fee (INR)",
              amount: Number(firaData.skydoWireFee.toFixed(2))
            },
            {
              type: "FIRA Fee (INR)",
              amount: Number(firaData.skydoFiraFee.toFixed(2))
            },
            {
              type: "Transaction Fee (INR)",
              amount: Number(firaData.transactionSkydoFee.toFixed(2))
            }
          ],
          totalOnTransaction: Number(
            (firaData.skydoWireFee + firaData.skydoFiraFee + firaData.transactionSkydoFee).toFixed(2)
          ),
          effectiveCost: skydoEffectiveCost
        },
        savings: {
          amount: Number((firaData.finalInrAmountSkydo - firaData.finalInrAmount).toFixed(2)),
          percentage: Number(
            (((firaData.finalInrAmountSkydo - firaData.finalInrAmount) / firaData.finalInrAmount) * 100).toFixed(2)
          )
        },
        transactionAmount: Number(firaData.inrAmount.toFixed(2)),
        originalAmount: Number(firaData.amount.toFixed(2)),
        currency: firaData.currency
      };
      
      console.log('Transformed data:', transformedData);
      setAnalysisData(transformedData);
      toast({
        title: "Analysis Complete",
        description: "Your FIRA document has been successfully analyzed.",
      });
    } catch (error) {
      console.error('Error processing FIRA file:', error);
      toast({
        title: "Processing Failed",
        description: error instanceof Error ? error.message : "Failed to process the FIRA document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleBackToHome = () => {
    setUploadedFile(null);
    setAnalysisData(null);
    setIsAnalyzing(false);
  };

  const handleLogoClick = () => {
    handleBackToHome();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Skydo Logo - Left aligned */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-start top-6 z-10 mb-8"
        >
          <button 
            onClick={handleLogoClick}
            className="hover:opacity-80 transition-opacity duration-200"
          >
            <img 
              src="/lovable-uploads/8a593f9d-5b27-4492-ab02-1b13c5699292.png" 
              alt="Skydo Logo" 
              className="h-9 w-auto" 
            />
          </button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-slate-800 mb-4">
            Find Hidden Costs in Your{" "}
            <AnimatedHeaderText />
            {" "}Document
          </h1>
          <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
            Upload your FIRA document to instantly compare your provider's exchange rate against the live market rate offered by Skydo.
          </p>
        </motion.div>

        {!analysisData && !isAnalyzing && (
          <FileUpload onFileUpload={handleFileUpload} />
        )}

        {isAnalyzing && <LoadingStages />}

        {analysisData && (
          <ComparisonResults 
            data={analysisData} 
            onBackToHome={handleBackToHome} 
          />
        )}
      </div>
    </div>
  );
};

export default Index;
