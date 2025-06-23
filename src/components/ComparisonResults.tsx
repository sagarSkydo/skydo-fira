import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, TrendingDown, ChevronDown, ChevronUp, Info, ExternalLink, Edit3 } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";

interface ComparisonResultsProps {
  data: {
    currentProvider: {
      name: string;
      paymentAmount: number;
      charges: Array<{
        type: string;
        amount: number;
        isPercentage?: boolean;
      }>;
      totalOnTransaction: number;
      effectiveCost: number;
    };
    skydo: {
      name: string;
      paymentAmount: number;
      charges: Array<{
        type: string;
        amount: number;
        isPercentage?: boolean;
      }>;
      totalOnTransaction: number;
      effectiveCost: number;
    };
    savings: {
      amount: number;
      percentage: number;
    };
    transactionAmount: number;
    originalAmount?: number;
    currency?: string;
  };
  onBackToHome: () => void;
}

export const ComparisonResults = ({
  data,
  onBackToHome
}: ComparisonResultsProps) => {
  // Calculate if Skydo offers better value
  const skydoAmount = data.skydo.paymentAmount - data.skydo.totalOnTransaction;
  const currentProviderAmount = data.currentProvider.paymentAmount - data.currentProvider.totalOnTransaction;
  const isSkydoBetter = skydoAmount > currentProviderAmount;

  // Set features open by default if Skydo is not better
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(!isSkydoBetter);
  const currency = data.currency || 'USD';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatOriginalCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const formatChargeAmount = (charge: any) => {
    if (charge.type === "FX Rate") {
      return `₹${charge.amount}`;
    } else if (charge.type === "Wire Fee" || charge.type === "FIRA Fee") {
      return charge.amount === 0 ? "FREE" : formatOriginalCurrency(charge.amount);
    }
    return charge.isPercentage ? formatPercentage(charge.amount) : formatCurrency(charge.amount);
  };

  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.6
  }} className="max-w-6xl mx-auto space-y-8 relative pt-6">
      {/* Enhanced Glassmorphic Back Button */}
      <motion.button initial={{
      opacity: 0,
      scale: 0.8
    }} animate={{
      opacity: 1,
      scale: 1
    }} transition={{
      delay: 0.1
    }} onClick={onBackToHome} className="fixed top-20 left-8 z-50 w-14 h-14 rounded-full backdrop-blur-xl bg-white/30 border border-white/40 shadow-2xl hover:bg-white/40 hover:scale-105 hover:shadow-3xl transition-all duration-300 flex items-center justify-center group before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300">
        <ArrowLeft className="w-6 h-6 text-slate-800 group-hover:text-slate-900 transition-all duration-300 relative z-10 drop-shadow-sm" />
      </motion.button>

      {/* Savings Header - Only show if Skydo is better */}
      {isSkydoBetter && (
        <motion.div initial={{
          scale: 0.9
        }} animate={{
          scale: 1
        }} transition={{
          delay: 0.2
        }} className="text-center">
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-lg">
            <CardContent className="pt-8 pb-6">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <TrendingDown className="w-8 h-8 text-green-600" />
                <h2 className="text-3xl font-bold text-black">
                  You could save <span style={{
                  color: '#13734e'
                }}>{formatCurrency(Math.abs(data.savings.amount))}</span> with Skydo
                </h2>
              </div>
              <p className="text-green-700 text-lg">
                That's {formatPercentage(Math.abs(data.savings.percentage))} more than your current provider
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Comparison Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Current Provider */}
        <motion.div initial={{
        opacity: 0,
        x: -50
      }} animate={{
        opacity: 1,
        x: 0
      }} transition={{
        delay: 0.4
      }}>
          <Card className="h-full shadow-lg border-slate-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl text-slate-700 text-center">Current Provider</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Payment Amount without Edit Button */}
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600">Foreign Currency Amount</span>
                <span className="font-semibold text-slate-800">
                  {formatOriginalCurrency(data.originalAmount || 0)}
                </span>
              </div>

              {data.currentProvider.charges.map((charge, index) => <div key={index} className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600">{charge.type}</span>
                  <span className="font-semibold text-slate-800">
                    {formatChargeAmount(charge)}
                  </span>
                </div>)}
              
              <div className="pt-4 space-y-3 border-t border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-700">You'll receive</span>
                  <span className="font-bold text-lg text-slate-800">
                    {formatCurrency(data.currentProvider.paymentAmount - data.currentProvider.totalOnTransaction)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Effective cost</span>
                  <span className="text-slate-600">
                    {formatPercentage(data.currentProvider.effectiveCost)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Skydo */}
        <motion.div initial={{
        opacity: 0,
        x: 50
      }} animate={{
        opacity: 1,
        x: 0
      }} transition={{
        delay: 0.4
      }}>
          <Card className="h-full shadow-lg border-green-200 bg-gradient-to-br from-white to-green-50">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl text-green-700 text-center flex items-center justify-center space-x-2">
                <img src="/lovable-uploads/07586f70-3dc6-4a36-9683-1478e37a92d3.png" alt="Skydo Logo" className="w-6 h-6" />
                <span>Skydo</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Payment Amount */}
              <div className="flex justify-between items-center py-2 border-b border-green-100">
                <span className="text-slate-600">Foreign Currency Amount</span>
                <span className="font-semibold text-green-700">
                  {formatOriginalCurrency(data.originalAmount || 0)}
                </span>
              </div>

              {data.skydo.charges.map((charge, index) => <div key={index} className="flex justify-between items-center py-2 border-b border-green-100">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-600">{charge.type}</span>
                    {charge.type === "FX Rate" && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full border border-green-200">
                        0 Margin
                      </span>
                    )}
                  </div>
                  <span className="font-semibold text-green-700">
                    {formatChargeAmount(charge)}
                  </span>
                </div>)}
              
              <div className="pt-4 space-y-3 border-t border-green-200">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-700">You'll receive</span>
                  <span className="font-bold text-lg text-green-800">
                    {formatCurrency(data.skydo.paymentAmount - data.skydo.totalOnTransaction)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Effective cost</span>
                  <span className="text-green-600">
                    {formatPercentage(data.skydo.effectiveCost)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Skydo Features Collapsible */}
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 0.6
    }}>
        <Collapsible open={isFeaturesOpen} onOpenChange={setIsFeaturesOpen}>
          <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-sky-50">
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-blue-100/50 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-blue-800 flex items-center space-x-2">
                    <img src="/lovable-uploads/07586f70-3dc6-4a36-9683-1478e37a92d3.png" alt="Skydo Logo" className="w-6 h-6" />
                    <span>Why Choose Skydo?</span>
                  </CardTitle>
                  {isFeaturesOpen ? <ChevronUp className="w-5 h-5 text-blue-600" /> : <ChevronDown className="w-5 h-5 text-blue-600" />}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 pb-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100">
                    <span className="text-blue-700 font-medium">Transparent pricing</span>
                    <a href="https://www.skydo.com/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-5 h-5 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors">
                      <Info className="w-3 h-3 text-blue-600" />
                    </a>
                  </div>
                  
                  <div className="p-3 bg-white rounded-lg border border-blue-100">
                    <span className="text-blue-700 font-medium">Zero forex markup</span>
                  </div>
                  
                  <div className="p-3 bg-white rounded-lg border border-blue-100">
                    <span className="text-blue-700 font-medium">Free and instant FIRA/FIRC</span>
                  </div>
                  
                  <div className="p-3 bg-white rounded-lg border border-blue-100">
                    <span className="text-blue-700 font-medium">Personalised dashboard with invoicing and analytics</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100">
                    <span className="text-blue-700 font-medium">Support for payment via Links</span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full border border-green-200">
                      NEW
                    </span>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </motion.div>

      {/* Explore Skydo Button */}
      <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} transition={{
      delay: 0.8
    }} className="text-center">
        <Button onClick={() => window.open('https://www.skydo.com/', '_blank')} variant="outline" size="lg" className="bg-[#283c8b] text-white border-[#283c8b] hover:bg-[#1e2f6b] hover:border-[#1e2f6b] px-8 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
          <ExternalLink className="w-5 h-5 mr-2" />
          Explore Skydo
        </Button>
      </motion.div>
    </motion.div>;
};
