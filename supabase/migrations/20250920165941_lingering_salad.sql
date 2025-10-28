  /*
    # Insert sample components for website builder
    
    1. Sample Components
      - Header components with navigation
      - Hero sections with different styles
      - Feature sections
      - Pricing tables
      - Footer components
      - Contact forms
      - Testimonial sections

    2. Categories covered
      - header, hero, features, pricing, contact, footer, testimonials
  */

  INSERT INTO components (name, category, html, tags, is_premium) VALUES
  (
    'Modern Navigation Header',
    'header',
    '<header class="bg-white shadow-lg">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <h1 class="text-2xl font-bold text-gray-800">Your Logo</h1>
            </div>
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <a href="#" class="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">Home</a>
              <a href="#" class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">About</a>
              <a href="#" class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">Services</a>
              <a href="#" class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">Contact</a>
            </div>
          </div>
          <div class="hidden sm:ml-6 sm:flex sm:items-center">
            <button class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium">Get Started</button>
          </div>
        </div>
      </nav>
    </header>',
    ARRAY['navigation', 'header', 'responsive', 'modern'],
    false
  ),
  (
    'Hero Section with CTA',
    'hero',
    '<section class="bg-gradient-to-r from-purple-600 to-blue-600">
      <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
        <h2 class="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          <span class="block">Ready to dive in?</span>
          <span class="block text-purple-200">Start your free trial today.</span>
        </h2>
        <div class="mt-8 flex lg:mt-0 lg:flex-shrink-0">
          <div class="inline-flex rounded-md shadow">
            <a href="#" class="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-purple-600 bg-white hover:bg-purple-50">
              Get started
            </a>
          </div>
          <div class="ml-3 inline-flex rounded-md shadow">
            <a href="#" class="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700">
              Learn more
            </a>
          </div>
        </div>
      </div>
    </section>',
    ARRAY['hero', 'cta', 'gradient', 'buttons'],
    false
  ),
  (
    'Feature Grid Section',
    'features',
    '<section class="py-12 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="lg:text-center">
          <h2 class="text-base text-indigo-600 font-semibold tracking-wide uppercase">Features</h2>
          <p class="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            A better way to work
          </p>
          <p class="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Lorem ipsum dolor sit amet consect adipisicing elit. Possimus magnam voluptatum cupiditate veritatis in accusamus quisquam.
          </p>
        </div>

        <div class="mt-10">
          <dl class="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            <div class="relative">
              <dt>
                <div class="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <p class="ml-16 text-lg leading-6 font-medium text-gray-900">Competitive exchange rates</p>
              </dt>
              <dd class="mt-2 ml-16 text-base text-gray-500">
                Lorem ipsum, dolor sit amet consectetur adipisicing elit. Maiores impedit perferendis suscipit eaque.
              </dd>
            </div>

            <div class="relative">
              <dt>
                <div class="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                </div>
                <p class="ml-16 text-lg leading-6 font-medium text-gray-900">No hidden fees</p>
              </dt>
              <dd class="mt-2 ml-16 text-base text-gray-500">
                Lorem ipsum, dolor sit amet consectetur adipisicing elit. Maiores impedit perferendis suscipit eaque.
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>',
    ARRAY['features', 'grid', 'icons', 'two-column'],
    false
  ),
  (
    'Simple Pricing Table',
    'pricing',
    '<section class="bg-gray-50 py-12">
      <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h2 class="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Simple no-tricks pricing
          </h2>
          <p class="mt-4 text-xl text-gray-600">
            Choose an <strong>affordable plan</strong> that''s packed with the best features for engaging your audience, creating customer loyalty, and driving sales.
          </p>
        </div>
        <div class="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
          <div class="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200">
            <div class="p-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900">Hobby</h3>
              <p class="mt-4 text-sm text-gray-500">All the basics for starting a new business</p>
              <p class="mt-8">
                <span class="text-4xl font-extrabold text-gray-900">$12</span>
                <span class="text-base font-medium text-gray-500">/mo</span>
              </p>
              <a href="#" class="mt-8 block w-full bg-gray-800 border border-gray-800 rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-gray-900">Buy Hobby</a>
            </div>
            <div class="pt-6 pb-8 px-6">
              <h4 class="text-xs font-medium text-gray-900 tracking-wide uppercase">What''s included</h4>
              <ul class="mt-6 space-y-4">
                <li class="flex space-x-3">
                  <svg class="flex-shrink-0 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                  <span class="text-sm text-gray-500">Private forum access</span>
                </li>
                <li class="flex space-x-3">
                  <svg class="flex-shrink-0 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                  <span class="text-sm text-gray-500">Member resources</span>
                </li>
              </ul>
            </div>
          </div>
          <div class="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200">
            <div class="p-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900">Growth</h3>
              <p class="mt-4 text-sm text-gray-500">Everything in Hobby, plus advanced features</p>
              <p class="mt-8">
                <span class="text-4xl font-extrabold text-gray-900">$32</span>
                <span class="text-base font-medium text-gray-500">/mo</span>
              </p>
              <a href="#" class="mt-8 block w-full bg-gray-800 border border-gray-800 rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-gray-900">Buy Growth</a>
            </div>
          </div>
          <div class="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200">
            <div class="p-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900">Scale</h3>
              <p class="mt-4 text-sm text-gray-500">Advanced features for scaling your business</p>
              <p class="mt-8">
                <span class="text-4xl font-extrabold text-gray-900">$72</span>
                <span class="text-base font-medium text-gray-500">/mo</span>
              </p>
              <a href="#" class="mt-8 block w-full bg-gray-800 border border-gray-800 rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-gray-900">Buy Scale</a>
            </div>
          </div>
        </div>
      </div>
    </section>',
    ARRAY['pricing', 'table', 'three-tier', 'cards'],
    false
  ),
  (
    'Contact Form Section',
    'contact',
    '<section class="bg-white py-16 px-4 overflow-hidden sm:px-6 lg:px-8 lg:py-24">
      <div class="relative max-w-xl mx-auto">
        <div class="text-center">
          <h2 class="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Contact Us
          </h2>
          <p class="mt-4 text-lg leading-6 text-gray-500">
            We''d love to hear from you. Send us a message and we''ll respond as soon as possible.
          </p>
        </div>
        <div class="mt-12">
          <form class="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
            <div class="sm:col-span-2">
              <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
              <div class="mt-1">
                <input type="text" name="name" id="name" class="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md">
              </div>
            </div>
            <div class="sm:col-span-2">
              <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
              <div class="mt-1">
                <input id="email" name="email" type="email" class="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md">
              </div>
            </div>
            <div class="sm:col-span-2">
              <label for="subject" class="block text-sm font-medium text-gray-700">Subject</label>
              <div class="mt-1">
                <input type="text" name="subject" id="subject" class="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md">
              </div>
            </div>
            <div class="sm:col-span-2">
              <label for="message" class="block text-sm font-medium text-gray-700">Message</label>
              <div class="mt-1">
                <textarea id="message" name="message" rows="4" class="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md"></textarea>
              </div>
            </div>
            <div class="sm:col-span-2">
              <button type="submit" class="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Send Message
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>',
    ARRAY['contact', 'form', 'responsive', 'centered'],
    false
  ),
  (
    'Simple Footer',
    'footer',
    '<footer class="bg-gray-800">
      <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div class="xl:grid xl:grid-cols-3 xl:gap-8">
          <div class="space-y-8 xl:col-span-1">
            <div class="text-white text-xl font-bold">Your Logo</div>
            <p class="text-gray-300 text-base">
              Making the world a better place through constructing elegant hierarchies.
            </p>
            <div class="flex space-x-6">
              <a href="#" class="text-gray-400 hover:text-gray-300">
                <span class="sr-only">Facebook</span>
                <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fill-rule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clip-rule="evenodd" />
                </svg>
              </a>
              <a href="#" class="text-gray-400 hover:text-gray-300">
                <span class="sr-only">Twitter</span>
                <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>
          <div class="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
            <div class="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 class="text-sm font-semibold text-gray-400 tracking-wider uppercase">Solutions</h3>
                <ul class="mt-4 space-y-4">
                  <li><a href="#" class="text-base text-gray-300 hover:text-white">Marketing</a></li>
                  <li><a href="#" class="text-base text-gray-300 hover:text-white">Analytics</a></li>
                  <li><a href="#" class="text-base text-gray-300 hover:text-white">Commerce</a></li>
                  <li><a href="#" class="text-base text-gray-300 hover:text-white">Insights</a></li>
                </ul>
              </div>
              <div class="mt-12 md:mt-0">
                <h3 class="text-sm font-semibold text-gray-400 tracking-wider uppercase">Support</h3>
                <ul class="mt-4 space-y-4">
                  <li><a href="#" class="text-base text-gray-300 hover:text-white">Pricing</a></li>
                  <li><a href="#" class="text-base text-gray-300 hover:text-white">Documentation</a></li>
                  <li><a href="#" class="text-base text-gray-300 hover:text-white">Guides</a></li>
                  <li><a href="#" class="text-base text-gray-300 hover:text-white">API Status</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div class="mt-12 border-t border-gray-700 pt-8">
          <p class="text-base text-gray-400 xl:text-center">
            &copy; 2024 Your Company, Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>',
    ARRAY['footer', 'links', 'social', 'dark'],
    false
  ),
  (
    'Testimonials Section',
    'testimonials',
    '<section class="bg-gray-50 py-16">
      <div class="max-w-7xl mx-auto md:grid md:grid-cols-2 md:px-6 lg:px-8">
        <div class="py-12 px-4 sm:px-6 md:flex md:flex-col md:py-16 md:pl-0 md:pr-10 md:border-r md:border-gray-200 lg:pr-16">
          <div class="md:flex-shrink-0">
            <div class="text-base text-indigo-600 font-semibold tracking-wide uppercase">Testimonials</div>
          </div>
          <blockquote class="mt-6 md:flex-grow md:flex md:flex-col">
            <div class="relative text-lg font-medium text-gray-800 md:flex-grow">
              <svg class="absolute top-0 left-0 transform -translate-x-3 -translate-y-2 h-8 w-8 text-indigo-600" fill="currentColor" viewBox="0 0 32 32">
                <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
              </svg>
              <p class="relative">
                Tincidunt integer commodo, cursus etiam aliquam neque, et. Consectetur pretium in volutpat, diam. Montes, magna cursus nulla feugiat dignissim id lobortis amet.
              </p>
            </div>
            <footer class="mt-8">
              <div class="flex items-start">
                <div class="flex-shrink-0 inline-flex rounded-full border-2 border-white">
                  <img class="h-12 w-12 rounded-full" src="https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" />
                </div>
                <div class="ml-4">
                  <div class="text-base font-medium text-gray-900">Judith Black</div>
                  <div class="text-base font-medium text-indigo-600">CEO, Tuple</div>
                </div>
              </div>
            </footer>
          </blockquote>
        </div>
        <div class="py-12 px-4 border-t-2 border-indigo-900 sm:px-6 md:py-16 md:pr-0 md:pl-10 md:border-t-0 md:border-l lg:pl-16">
          <div class="md:flex-shrink-0">
            <div class="text-base text-indigo-600 font-semibold tracking-wide uppercase">Testimonials</div>
          </div>
          <blockquote class="mt-6 md:flex-grow md:flex md:flex-col">
            <div class="relative text-lg font-medium text-gray-800 md:flex-grow">
              <svg class="absolute top-0 left-0 transform -translate-x-3 -translate-y-2 h-8 w-8 text-indigo-600" fill="currentColor" viewBox="0 0 32 32">
                <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
              </svg>
              <p class="relative">
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore.
              </p>
            </div>
            <footer class="mt-8">
              <div class="flex items-start">
                <div class="flex-shrink-0 inline-flex rounded-full border-2 border-white">
                  <img class="h-12 w-12 rounded-full" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" />
                </div>
                <div class="ml-4">
                  <div class="text-base font-medium text-gray-900">Joseph Rodriguez</div>
                  <div class="text-base font-medium text-indigo-600">CEO, Reform</div>
                </div>
              </div>
            </footer>
          </blockquote>
        </div>
      </div>
    </section>',
    ARRAY['testimonials', 'quotes', 'two-column', 'images'],
    false
  );