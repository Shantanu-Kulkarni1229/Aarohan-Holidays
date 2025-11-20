// NEW SECTIONS FOR TOURFORM.JSX
// Add these sections to your TourForm.jsx file

// ============================================
// 1. FLEXIBLE PRICING SECTION (Replace existing pricing section)
// ============================================

const FlexiblePricingSection = ({ formData, colors, handleObjectArrayChange, addArrayItem, removeArrayItem, errors }) => (
  <div id="pricing" className="bg-white rounded-xl shadow-lg border p-8" style={{ borderColor: colors.border }}>
    <div className="flex items-center mb-6">
      <div 
        className="w-12 h-12 rounded-xl flex items-center justify-center mr-4"
        style={{ backgroundColor: colors.primary + '15' }}
      >
        <span className="text-2xl">💰</span>
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: colors.darkBg }}>Flexible Pricing</h2>
        <p style={{ color: colors.textDark }}>Set custom pricing categories for each departure city (optional)</p>
      </div>
    </div>
    
    {errors.cityPricing && (
      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600 text-sm font-medium">{errors.cityPricing}</p>
      </div>
    )}
    
    {formData.cityPricing.map((cityPrice, cityIndex) => (
      <div 
        key={cityIndex} 
        className="p-6 rounded-xl border mb-6"
        style={{ 
          backgroundColor: colors.lightBg,
          borderColor: colors.border
        }}
      >
        {/* City Name */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2" style={{ color: colors.darkBg }}>
            🏙️ City Name
          </label>
          <input
            type="text"
            value={cityPrice.city}
            onChange={(e) => handleObjectArrayChange('cityPricing', cityIndex, 'city', e.target.value)}
            className="w-full px-4 py-3 border-2 rounded-xl transition-all"
            style={{ 
              borderColor: colors.border,
              focusBorderColor: colors.primary
            }}
            placeholder="e.g., Mumbai, Delhi, Bangalore"
          />
        </div>

        {/* Pricing Options */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold mb-2" style={{ color: colors.darkBg }}>
            💵 Pricing Options
          </label>
          
          {cityPrice.pricingOptions && cityPrice.pricingOptions.map((option, optionIndex) => (
            <div key={optionIndex} className="flex gap-3 items-end">
              <div className="flex-1">
                <input
                  type="text"
                  value={option.categoryName}
                  onChange={(e) => {
                    const newPricingOptions = [...cityPrice.pricingOptions];
                    newPricingOptions[optionIndex].categoryName = e.target.value;
                    handleObjectArrayChange('cityPricing', cityIndex, 'pricingOptions', newPricingOptions);
                  }}
                  className="w-full px-4 py-3 border-2 rounded-xl"
                  style={{ borderColor: colors.border }}
                  placeholder="e.g., Economy, Deluxe, Premium"
                />
              </div>
              <div className="flex-1">
                <input
                  type="number"
                  value={option.price}
                  onChange={(e) => {
                    const newPricingOptions = [...cityPrice.pricingOptions];
                    newPricingOptions[optionIndex].price = Number(e.target.value);
                    handleObjectArrayChange('cityPricing', cityIndex, 'pricingOptions', newPricingOptions);
                  }}
                  className="w-full px-4 py-3 border-2 rounded-xl"
                  style={{ borderColor: colors.border }}
                  placeholder="Price in ₹"
                  min="0"
                />
              </div>
              {cityPrice.pricingOptions.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    const newPricingOptions = cityPrice.pricingOptions.filter((_, i) => i !== optionIndex);
                    handleObjectArrayChange('cityPricing', cityIndex, 'pricingOptions', newPricingOptions);
                  }}
                  className="px-4 py-3 rounded-xl text-white hover:bg-red-600 transition-colors"
                  style={{ backgroundColor: '#EF4444' }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          
          <button
            type="button"
            onClick={() => {
              const newPricingOptions = [...(cityPrice.pricingOptions || []), { categoryName: '', price: '' }];
              handleObjectArrayChange('cityPricing', cityIndex, 'pricingOptions', newPricingOptions);
            }}
            className="inline-flex items-center px-4 py-2 rounded-xl text-sm transition-colors"
            style={{ backgroundColor: colors.secondary, color: 'white' }}
          >
            + Add Pricing Option
          </button>
        </div>

        {/* Remove City Button */}
        {formData.cityPricing.length > 1 && (
          <div className="mt-4 pt-4 border-t" style={{ borderColor: colors.border }}>
            <button
              type="button"
              onClick={() => removeArrayItem('cityPricing', cityIndex)}
              className="px-4 py-2 rounded-xl transition-colors flex items-center text-white"
              style={{ backgroundColor: '#EF4444' }}
            >
              <span className="mr-2">🗑️</span>
              Remove City
            </button>
          </div>
        )}
      </div>
    ))}

    <button
      type="button"
      onClick={() => addArrayItem('cityPricing', { city: '', pricingOptions: [{ categoryName: '', price: '' }] })}
      className="inline-flex items-center px-6 py-3 rounded-xl transition-colors transform hover:scale-105 text-white"
      style={{ backgroundColor: colors.primary }}
    >
      <span className="mr-2 text-xl">+</span>
      Add Another City
    </button>
  </div>
);

// ============================================
// 2. ADD-ONS SECTION (New)
// ============================================

const AddOnsSection = ({ formData, colors, handleObjectArrayChange, addArrayItem, removeArrayItem }) => (
  <div id="addons" className="bg-white rounded-xl shadow-lg border p-8" style={{ borderColor: colors.border }}>
    <div className="flex items-center mb-6">
      <div 
        className="w-12 h-12 rounded-xl flex items-center justify-center mr-4"
        style={{ backgroundColor: colors.secondary + '15' }}
      >
        <span className="text-2xl">➕</span>
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: colors.darkBg }}>Add-on Options</h2>
        <p style={{ color: colors.textDark }}>Optional extras that guests can purchase (optional)</p>
      </div>
    </div>
    
    {formData.addOns && formData.addOns.map((addon, index) => (
      <div 
        key={index} 
        className="p-6 rounded-xl border mb-4"
        style={{ 
          backgroundColor: colors.lightBg,
          borderColor: colors.border
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: colors.darkBg }}>
              Add-on Name
            </label>
            <input
              type="text"
              value={addon.name}
              onChange={(e) => handleObjectArrayChange('addOns', index, 'name', e.target.value)}
              className="w-full px-4 py-3 border-2 rounded-xl"
              style={{ borderColor: colors.border }}
              placeholder="e.g., Extra Meal, Guide Service"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: colors.darkBg }}>
              Price (₹)
            </label>
            <input
              type="number"
              value={addon.price}
              onChange={(e) => handleObjectArrayChange('addOns', index, 'price', Number(e.target.value))}
              className="w-full px-4 py-3 border-2 rounded-xl"
              style={{ borderColor: colors.border }}
              placeholder="500"
              min="0"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: colors.darkBg }}>
            Description
          </label>
          <textarea
            value={addon.description}
            onChange={(e) => handleObjectArrayChange('addOns', index, 'description', e.target.value)}
            className="w-full px-4 py-3 border-2 rounded-xl"
            style={{ borderColor: colors.border }}
            placeholder="Brief description of the add-on"
            rows={2}
          />
        </div>

        {formData.addOns.length > 1 && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => removeArrayItem('addOns', index)}
              className="px-4 py-2 rounded-xl text-white transition-colors"
              style={{ backgroundColor: '#EF4444' }}
            >
              🗑️ Remove Add-on
            </button>
          </div>
        )}
      </div>
    ))}

    <button
      type="button"
      onClick={() => addArrayItem('addOns', { name: '', price: '', description: '' })}
      className="inline-flex items-center px-6 py-3 rounded-xl transition-colors text-white"
      style={{ backgroundColor: colors.secondary }}
    >
      <span className="mr-2">+</span>
      Add Another Add-on
    </button>
  </div>
);

// ============================================
// 3. ADDON FACILITIES SECTION (New)
// ============================================

const AddonFacilitiesSection = ({ formData, colors, handleObjectArrayChange, addArrayItem, removeArrayItem }) => (
  <div id="facilities" className="bg-white rounded-xl shadow-lg border p-8" style={{ borderColor: colors.border }}>
    <div className="flex items-center mb-6">
      <div 
        className="w-12 h-12 rounded-xl flex items-center justify-center mr-4"
        style={{ backgroundColor: '#10B981' + '15' }}
      >
        <span className="text-2xl">🏨</span>
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: colors.darkBg }}>Additional Facilities</h2>
        <p style={{ color: colors.textDark }}>Detailed facility information with sub-points (optional)</p>
      </div>
    </div>
    
    {formData.addonFacilities && formData.addonFacilities.map((facility, facilityIndex) => (
      <div 
        key={facilityIndex} 
        className="p-6 rounded-xl border mb-4"
        style={{ 
          backgroundColor: colors.lightBg,
          borderColor: colors.border
        }}
      >
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2" style={{ color: colors.darkBg }}>
            📌 Facility Header
          </label>
          <input
            type="text"
            value={facility.header}
            onChange={(e) => handleObjectArrayChange('addonFacilities', facilityIndex, 'header', e.target.value)}
            className="w-full px-4 py-3 border-2 rounded-xl"
            style={{ borderColor: colors.border }}
            placeholder="e.g., Transportation, Accommodation, Safety"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: colors.darkBg }}>
            📝 Sub-Points
          </label>
          
          {facility.subPoints && facility.subPoints.map((subPoint, subIndex) => (
            <div key={subIndex} className="flex gap-3 mb-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-3"
                style={{ backgroundColor: '#10B981' + '15' }}>
                <span className="text-sm font-bold" style={{ color: '#10B981' }}>{subIndex + 1}</span>
              </div>
              <input
                type="text"
                value={subPoint}
                onChange={(e) => {
                  const newSubPoints = [...facility.subPoints];
                  newSubPoints[subIndex] = e.target.value;
                  handleObjectArrayChange('addonFacilities', facilityIndex, 'subPoints', newSubPoints);
                }}
                className="flex-1 px-4 py-3 border-2 rounded-xl"
                style={{ borderColor: colors.border }}
                placeholder="Enter facility detail"
              />
              {facility.subPoints.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    const newSubPoints = facility.subPoints.filter((_, i) => i !== subIndex);
                    handleObjectArrayChange('addonFacilities', facilityIndex, 'subPoints', newSubPoints);
                  }}
                  className="px-4 py-3 rounded-xl text-white hover:bg-red-600 transition-colors"
                  style={{ backgroundColor: '#EF4444' }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          
          <button
            type="button"
            onClick={() => {
              const newSubPoints = [...(facility.subPoints || []), ''];
              handleObjectArrayChange('addonFacilities', facilityIndex, 'subPoints', newSubPoints);
            }}
            className="inline-flex items-center px-4 py-2 rounded-xl text-sm transition-colors mt-2"
            style={{ backgroundColor: '#10B981', color: 'white' }}
          >
            + Add Sub-Point
          </button>
        </div>

        {formData.addonFacilities.length > 1 && (
          <div className="mt-4 pt-4 border-t" style={{ borderColor: colors.border }}>
            <button
              type="button"
              onClick={() => removeArrayItem('addonFacilities', facilityIndex)}
              className="px-4 py-2 rounded-xl text-white transition-colors"
              style={{ backgroundColor: '#EF4444' }}
            >
              🗑️ Remove Facility
            </button>
          </div>
        )}
      </div>
    ))}

    <button
      type="button"
      onClick={() => addArrayItem('addonFacilities', { header: '', subPoints: [''] })}
      className="inline-flex items-center px-6 py-3 rounded-xl transition-colors text-white"
      style={{ backgroundColor: '#10B981' }}
    >
      <span className="mr-2">+</span>
      Add Another Facility
    </button>
  </div>
);

// Export the components
export { FlexiblePricingSection, AddOnsSection, AddonFacilitiesSection };
