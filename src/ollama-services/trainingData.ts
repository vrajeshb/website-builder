class TrainingDataService {
    private trainingData: Record<string, string[]> = {
      'e-commerce': [
        `<!-- Modern E-commerce Header with Search -->
  <header class="bg-white shadow-md">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between py-4">
        <a href="/" class="text-2xl font-bold text-indigo-600">ShopHub</a>
        <nav class="hidden md:flex space-x-6">
          <a href="/products">Products</a>
          <a href="/deals">Deals</a>
        </nav>
      </div>
    </div>
  </header>`,
        `<!-- E-commerce Header with Dark Theme -->
  <header class="bg-slate-900 text-white">
    <div class="container mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <div class="text-2xl font-bold">StoreFront</div>
        <nav class="hidden lg:flex space-x-8">
          <a href="/sale" class="text-yellow-400">Sale</a>
        </nav>
      </div>
    </div>
  </header>`,
      ],
      'real-estate': [
        `<!-- Real Estate Header -->
  <header class="bg-white shadow-sm border-b">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between py-4">
        <span class="text-2xl font-bold">HomeFind</span>
        <nav class="hidden md:flex space-x-8">
          <a href="/buy">Buy</a>
          <a href="/rent">Rent</a>
        </nav>
      </div>
    </div>
  </header>`,
        `<!-- Luxury Real Estate Header -->
  <header class="bg-slate-900 text-white">
    <div class="container mx-auto px-4 py-5">
      <div class="text-3xl font-serif font-bold">LUXURY ESTATES</div>
      <nav class="hidden lg:flex space-x-10">
        <a href="/exclusive">Exclusive Listings</a>
      </nav>
    </div>
  </header>`,
      ],
    };
  
    getExamplesForCategory(category: string): string[] {
      if (category === 'custom' || category === 'all') {
        return Object.values(this.trainingData).flat().slice(0, 2);
      }
      return this.trainingData[category] || [];
    }
  
    getAllCategories(): string[] {
      return Object.keys(this.trainingData);
    }
  }
  
  export const trainingDataService = new TrainingDataService();
  