import React, { useState, useMemo, useEffect } from 'react';
import { Search, MapPin, SlidersHorizontal, ArrowRight, ShieldCheck, Clock, Sparkles } from 'lucide-react';
import FoodCard from '../components/FoodCard';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { CATEGORIES, NEARBY_RESTAURANTS } from '../data/mockData';
import { apiGetApprovedRestaurants } from '../services/api';

export default function HomeView({ foodItems, onSelectFood, onExploreCategory, onOpenAuth }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('Indiranagar & Domlur');
  const [selectedDietary, setSelectedDietary] = useState('all');
  const [approvedRestaurants, setApprovedRestaurants] = useState(NEARBY_RESTAURANTS);

  useEffect(() => {
    apiGetApprovedRestaurants()
      .then(res => {
        if (res && res.length > 0) {
          const mapped = res.map(r => ({
            id: `rest-${r.id}`,
            name: r.business_name,
            type: r.business_type,
            mealsRescued: 450,
            rating: 4.9,
            address: `${r.address} (${r.locality})`,
            image: r.image_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80'
          }));
          setApprovedRestaurants(mapped);
        }
      })
      .catch(() => {});
  }, []);

  // Filtered food items
  const filteredFood = useMemo(() => {
    return foodItems.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.restaurantName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;

      const matchesDietary =
        selectedDietary === 'all' ||
        (item.dietary && item.dietary.some(d => d.toLowerCase().includes(selectedDietary.toLowerCase())));

      return matchesSearch && matchesCategory && matchesDietary;
    });
  }, [foodItems, searchQuery, selectedCategory, selectedDietary]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      {/* Editorial-style Apple-inspired Hero Section */}
      <section
        style={{
          paddingTop: 'var(--space-8)',
          paddingBottom: 'var(--space-6)',
          textAlign: 'center',
          maxWidth: '880px',
          margin: '0 auto'
        }}
      >
        <div style={{ display: 'inline-flex', marginBottom: 'var(--space-3)' }}>
          <Badge variant="primary">
            <Sparkles size={12} /> Bengaluru Surplus Food Marketplace
          </Badge>
        </div>

        <h1
          className="text-hero"
          style={{
            marginBottom: 'var(--space-4)',
            letterSpacing: '-0.03em'
          }}
        >
          Good food deserves <br /> another chance.
        </h1>

        <p
          className="text-body-lead"
          style={{
            maxWidth: '640px',
            margin: '0 auto var(--space-6)',
            lineHeight: 1.6
          }}
        >
          Discover delicious meals at better prices while helping local businesses reduce food waste.
        </p>

        {/* Location & Surplus Search Area - Crisp Solid Surface */}
        <div
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-section)',
            boxShadow: 'var(--shadow-card)',
            padding: 'var(--space-3)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
            maxWidth: '740px',
            margin: '0 auto',
            textAlign: 'left'
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--space-3)',
              alignItems: 'center'
            }}
          >
            {/* Search Input */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  color: 'var(--color-text-tertiary)',
                  pointerEvents: 'none'
                }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sourdough, biryani, artisanal pizza, rolls..."
                aria-label="Search food or restaurant"
                style={{
                  width: '100%',
                  height: '44px',
                  paddingLeft: '38px',
                  paddingRight: '12px',
                  backgroundColor: 'var(--color-bg-surface-secondary)',
                  border: '1px solid transparent',
                  borderRadius: 'var(--radius-input)',
                  fontSize: '0.9375rem',
                  color: 'var(--color-text-primary)'
                }}
              />
            </div>

            {/* Location Selector */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <MapPin
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  color: 'var(--color-primary-accent)',
                  pointerEvents: 'none'
                }}
              />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                aria-label="Select location"
                style={{
                  width: '100%',
                  height: '44px',
                  paddingLeft: '38px',
                  paddingRight: '12px',
                  backgroundColor: 'var(--color-bg-surface-secondary)',
                  border: '1px solid transparent',
                  borderRadius: 'var(--radius-input)',
                  fontSize: '0.9375rem',
                  color: 'var(--color-text-primary)',
                  cursor: 'pointer'
                }}
              >
                <option value="Indiranagar & Domlur">Indiranagar & Domlur (within 2 km)</option>
                <option value="Koramangala & HSR">Koramangala & HSR Layout</option>
                <option value="Lavelle Road & Church St">Lavelle Road & Church St (CBD)</option>
                <option value="Whitefield">Whitefield & Marathahalli</option>
                <option value="Malleshwaram & Rajajinagar">Malleshwaram & Rajajinagar</option>
                <option value="Jayanagar & JP Nagar">Jayanagar & JP Nagar</option>
              </select>
            </div>

            {/* Search Button */}
            <Button
              variant="primary"
              size="lg"
              style={{ height: '44px' }}
              onClick={() => {
                const el = document.getElementById('marketplace-listings');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Find Surplus
            </Button>
          </div>
        </div>
      </section>

      {/* Categories & Filter Bar */}
      <section id="marketplace-listings" style={{ scrollMarginTop: '80px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--space-4)',
            flexWrap: 'wrap',
            gap: 'var(--space-3)'
          }}
        >
          <div>
            <h2 className="text-h2" style={{ marginBottom: '2px' }}>
              Today's Surplus Offers
            </h2>
            <p className="text-small">
              {filteredFood.length} delicious rescued meals available right now
            </p>
          </div>

          {/* Dietary Filter Segment */}
          <div className="segmented-control" role="group" aria-label="Dietary preferences">
            {['all', 'vegan', 'vegetarian'].map((diet) => (
              <button
                key={diet}
                type="button"
                className={`segmented-option ${selectedDietary === diet ? 'active' : ''}`}
                onClick={() => setSelectedDietary(diet)}
              >
                {diet === 'all' ? 'All Diets' : diet.charAt(0).toUpperCase() + diet.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-2)',
            overflowX: 'auto',
            paddingBottom: 'var(--space-3)',
            marginBottom: 'var(--space-5)'
          }}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '7px 16px',
                  borderRadius: '10px',
                  fontSize: '0.875rem',
                  fontWeight: isSelected ? 600 : 500,
                  whiteSpace: 'nowrap',
                  backgroundColor: isSelected ? 'var(--color-primary-accent)' : 'var(--color-bg-surface)',
                  color: isSelected ? '#FFFFFF' : 'var(--color-text-secondary)',
                  border: isSelected ? '1px solid var(--color-primary-accent)' : '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all var(--transition-fast)',
                  cursor: 'pointer'
                }}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Food Items Grid */}
        {filteredFood.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 'var(--space-5)'
            }}
          >
            {filteredFood.map((food) => (
              <FoodCard key={food.id} food={food} onSelect={onSelectFood} />
            ))}
          </div>
        ) : (
          <div
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-card)',
              padding: 'var(--space-8) var(--space-4)',
              textAlign: 'center'
            }}
          >
            <p className="text-h3" style={{ marginBottom: 'var(--space-2)' }}>
              No surplus matches found
            </p>
            <p className="text-body-muted" style={{ maxWidth: '400px', margin: '0 auto var(--space-4)' }}>
              Try adjusting your search criteria or resetting filters to see available meals.
            </p>
            <Button
              variant="secondary"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedDietary('all');
              }}
            >
              Reset Filters
            </Button>
          </div>
        )}
      </section>

      {/* Nearby Partner Restaurants */}
      <section style={{ paddingTop: 'var(--space-6)' }}>
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <h2 className="text-h2" style={{ marginBottom: '2px' }}>
            Featured Partner Kitchens
          </h2>
          <p className="text-small">
            Local bakeries and restaurants dedicated to cutting food waste
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'var(--space-5)'
          }}
        >
          {approvedRestaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'var(--color-bg-surface)'
              }}
            >
              <div style={{ height: '150px', position: 'relative', overflow: 'hidden' }}>
                <img
                  src={restaurant.image}
                  alt={restaurant.name}
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ padding: 'var(--space-4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                  <h4 className="text-h4">{restaurant.name}</h4>
                  <span className="font-semibold text-small" style={{ color: 'var(--color-warning)' }}>
                    ★ {restaurant.rating}
                  </span>
                </div>
                <p className="text-small" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)' }}>
                  {restaurant.type} • {restaurant.address}
                </p>
                <div
                  style={{
                    backgroundColor: 'var(--color-bg-surface-secondary)',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span className="text-micro" style={{ color: 'var(--color-text-secondary)' }}>
                    Total Meals Rescued:
                  </span>
                  <span className="font-semibold text-small" style={{ color: 'var(--color-success)' }}>
                    {restaurant.mealsRescued} meals
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How MealLoop Works (Solid 3-Step Apple Layout) */}
      <section
        id="how-it-works"
        style={{
          backgroundColor: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-section)',
          padding: 'var(--space-7) var(--space-6)',
          marginTop: 'var(--space-4)'
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto var(--space-7)' }}>
          <h2 className="text-h2" style={{ marginBottom: 'var(--space-2)' }}>
            How MealLoop Works
          </h2>
          <p className="text-body-muted">
            Three simple steps to delicious food, substantial savings, and a healthier planet.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 'var(--space-6)'
          }}
        >
          {/* Step 1 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '11px',
                backgroundColor: 'var(--color-primary-accent-subtle)',
                color: 'var(--color-primary-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '1.125rem'
              }}
            >
              1
            </div>
            <h3 className="text-h4">Discover Daily Surplus</h3>
            <p className="text-body-muted">
              Explore surplus items from nearby artisan bakeries, organic cafes, and sushi bars prepared fresh today.
            </p>
          </div>

          {/* Step 2 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '11px',
                backgroundColor: 'var(--color-food-accent-subtle)',
                color: 'var(--color-food-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '1.125rem'
              }}
            >
              2
            </div>
            <h3 className="text-h4">Reserve with High Savings</h3>
            <p className="text-body-muted">
              Lock in dishes at up to 70% off with transparent pricing. Receive an instant pickup code on your dashboard.
            </p>
          </div>

          {/* Step 3 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '11px',
                backgroundColor: 'var(--color-success-subtle)',
                color: 'var(--color-success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '1.125rem'
              }}
            >
              3
            </div>
            <h3 className="text-h4">Collect During Window</h3>
            <p className="text-body-muted">
              Head over during the specified collection window, show your code, collect your order, and relish the meal.
            </p>
          </div>
        </div>
      </section>

      {/* Restaurant / Hotel Partner Invitation Banner */}
      <section
        style={{
          backgroundColor: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-section)',
          padding: 'var(--space-7) var(--space-6)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-5)'
        }}
      >
        <div style={{ maxWidth: '580px' }}>
          <div style={{ display: 'inline-flex', marginBottom: 'var(--space-2)' }}>
            <Badge variant="food">For Restaurant & Hotel Partners</Badge>
          </div>
          <h2 className="text-h2" style={{ marginBottom: 'var(--space-2)' }}>
            Partner with MealLoop Bengaluru
          </h2>
          <p className="text-body-muted">
            Turn daily surplus into recovered revenue and zero food waste. Register your food business in 2 minutes, get audited and approved by Platform Ops, and publish live surplus offers immediately.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Button
            variant="primary"
            size="lg"
            onClick={() => onOpenAuth && onOpenAuth('partner', 'register')}
          >
            Register New Hotel / Restaurant
          </Button>
        </div>
      </section>
    </div>
  );
}
