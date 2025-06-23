export interface FiraProcessingResult {
  success: boolean;
  message: string;
  firaData: FiraDataDto | null;
  processingTimeMs: number;
  errors: string[];
}

export interface FiraDataDto {
  id: number;
  amount: number;
  currency: string;
  inrAmount: number;
  fxRateSkydo: number;
  calculatedExchangeRate: number;
  transactionSkydoFee: number;
  skydoFiraFee: number;
  skydoWireFee: number;
  platformFiraFee: number;
  platformWireFee: number;
  platformTransactionFee: number;
  finalInrAmount: number;
  finalInrAmountSkydo: number;
  valueDate: string;
}

// Update enum to match backend's PaymentMethods
export enum PaymentMethod {
  BANK = "BANK",
  PAYONEER = "PAYONEER",
  WISE = "WISE",
  PAYPAL = "PAYPAL",
  OTHERS = "OTHERS"
}

export const uploadAndProcessFira = async (
  file: File, 
  paymentMethod: PaymentMethod,
  importerId?: number
): Promise<FiraProcessingResult> => {
  console.log("uploadAndProcessFira");
  // Build URL with query parameters
  const baseUrl = '/api/api/v1/fira/upload';
  const params = new URLSearchParams();
  params.append('paymentMethod', paymentMethod);
  
  if (importerId) {
    params.append('importerId', importerId.toString());
  }
  
  const urlWithParams = `${baseUrl}?${params.toString()}`;
  
  console.log('Starting API call to:', urlWithParams);
  console.log('File:', file.name, 'Size:', file.size, 'Type:', file.type);
  console.log('Payment Method:', paymentMethod);
  console.log('Importer ID:', importerId);

  const formData = new FormData();
  formData.append('file', file);

  console.log('FormData prepared (file only), making fetch request...');

  try {
    console.log('Making fetch request...');
    const response = await fetch(urlWithParams, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    });

    console.log('Response received:', response.status, response.statusText);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    // Log the raw response text first
    const responseText = await response.text();
    console.log('Raw response:', responseText);

    if (!response.ok) {
      console.error('Response not OK:', response.status, responseText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${responseText}`);
    }

    // Try to parse the response as JSON
    let result: FiraProcessingResult;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError);
      throw new Error(`Invalid JSON response: ${responseText}`);
    }

    console.log('API response parsed successfully:', result);
    
    // Validate response structure
    if (!result || typeof result.success !== 'boolean') {
      console.error('Invalid response structure:', result);
      throw new Error('Invalid response format from server');
    }

    // Validate firaData if success is true
    if (result.success) {
      if (!result.firaData) {
        console.error('Success is true but firaData is missing:', result);
        throw new Error('Server returned success but no data');
      }

      // Validate required fields in firaData
      const requiredFields = [
        'amount', 'currency', 'inrAmount', 'fxRateSkydo', 
        'calculatedExchangeRate', 'finalInrAmount', 'finalInrAmountSkydo'
      ];
      
      const missingFields = requiredFields.filter(field => 
        !(field in result.firaData) || result.firaData[field] === undefined
      );

      if (missingFields.length > 0) {
        console.error('Missing required fields in firaData:', missingFields);
        throw new Error(`Server response missing required fields: ${missingFields.join(', ')}`);
      }
    }
    
    if (!result.success && result.errors && result.errors.length > 0) {
      console.error('Server returned errors:', result.errors);
    }
    
    return result;
  } catch (error) {
    console.error('Fetch error details:', error);
    console.error('Error type:', typeof error);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Re-throw with more context
    throw new Error(`Failed to upload FIRA file: ${error instanceof Error ? error.message : 'Network error'}`);
  }
};
