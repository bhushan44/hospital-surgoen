# Doctor Scoring Algorithm

## Overview

The doctor scoring algorithm calculates a composite score (0-110 points) to rank doctors in search results. This ensures that the most qualified, reliable, and premium doctors appear first in the hospital dashboard.

## Scoring Factors

### 1. Experience Score (0-30 points)
- **Calculation**: Linear scaling based on years of experience
- **Formula**: `min(yearsOfExperience, 30)`
- **Rationale**: More experienced doctors are generally more skilled and reliable
- **Example**: 
  - 5 years = 5 points
  - 15 years = 15 points
  - 30+ years = 30 points (capped)

### 2. Subscription Plan Score (0-40 points)
- **Calculation**: Based on subscription tier + visibility weight multiplier
- **Tier Weights**:
  - Enterprise: 40 points
  - Premium: 30 points
  - Basic: 15 points
  - Free: 5 points
- **Visibility Weight**: Multiplier from `doctorPlanFeatures.visibilityWeight` (if available)
- **Rationale**: Premium subscriptions indicate commitment and should boost visibility
- **Example**:
  - Free plan = 5 points
  - Premium plan = 30 points
  - Enterprise plan = 40 points

### 3. Rating & Reviews Score (0-20 points)
- **Calculation**: Combines rating quality (0-12 points) + review count reliability (0-8 points)
- **Base Rating Score**: `(averageRating / 5) * 12`
- **Review Bonus**: `min(log10(max(totalRatings, 1)) * 2.5, 8)`
- **Rationale**: High ratings with many reviews are more reliable than high ratings with few reviews
- **Example**:
  - 5.0 stars, 10 reviews = 12 + 2.5 = 14.5 points
  - 4.8 stars, 100 reviews = 11.5 + 5 = 16.5 points
  - 4.5 stars, 1000 reviews = 10.8 + 7.5 = 18.3 points

### 4. Performance Score (0-10 points)
- **Calculation**: Logarithmic scaling based on completed assignments
- **Formula**: `min(log10(max(completedAssignments, 1)) * 3.33, 10)`
- **Rationale**: More completed assignments indicate reliability and activity
- **Example**:
  - 1 assignment = 0 points
  - 10 assignments = 3.3 points
  - 100 assignments = 6.7 points
  - 1000+ assignments = 10 points (capped)

### 5. Verification Status Score (0-10 points)
- **Calculation**: Fixed points based on license verification status
- **Values**:
  - Verified: 10 points
  - Pending: 3 points
  - Rejected: 0 points
- **Rationale**: Verified doctors are more trustworthy and should rank higher
- **Example**:
  - Verified doctor = 10 points
  - Pending verification = 3 points
  - Rejected = 0 points

## Total Score Calculation

```
Total Score = Experience + Plan + Rating + Performance + Verification
Maximum = 30 + 40 + 20 + 10 + 10 = 110 points
```

## Ranking Logic

1. **Accessibility Filter**: Doctors are first filtered based on hospital subscription tier
2. **Score Sorting**: Doctors are sorted by total score (descending)
3. **Tier Assignment**: Based on score and key metrics:
   - **Platinum** (Score ≥ 80 OR rating ≥ 4.8 + experience ≥ 15 + completed ≥ 400)
   - **Gold** (Score ≥ 60 OR rating ≥ 4.6 + experience ≥ 10 + completed ≥ 200)
   - **Silver** (All others)

## Real-World Considerations

### Why This Algorithm?

1. **Balanced Approach**: No single factor dominates, ensuring fair ranking
2. **Business Value**: Premium subscriptions get visibility boost (encourages upgrades)
3. **Quality Indicators**: Experience, ratings, and verification ensure quality
4. **Activity Metrics**: Completed assignments show reliability
5. **Transparency**: Score breakdown available for debugging/display

### Potential Enhancements

Future improvements could include:
- **Recency Factor**: Boost recently active doctors
- **Response Time**: Faster response times = higher score
- **Cancellation Rate**: Lower cancellation rate = higher score
- **Specialty Match**: Boost doctors matching exact specialty
- **Location Proximity**: Boost nearby doctors
- **Hospital History**: Boost doctors with previous successful assignments

## Implementation

The algorithm is implemented in:
- `lib/utils/doctor-scoring.ts` - Core scoring logic
- `app/api/hospitals/[id]/find-doctors/route.ts` - Integration with API

## Usage Example

```typescript
import { calculateDoctorScore } from '@/lib/utils/doctor-scoring';

const score = calculateDoctorScore({
  yearsOfExperience: 15,
  averageRating: 4.8,
  totalRatings: 150,
  completedAssignments: 300,
  licenseVerificationStatus: 'verified',
  subscriptionTier: 'premium',
  visibilityWeight: 1.5,
});

console.log(score.totalScore); // e.g., 85.5
console.log(score.breakdown); // Detailed breakdown
```

## Testing

To test the scoring algorithm:
1. Create test doctors with varying attributes
2. Calculate scores for each
3. Verify ranking order matches expectations
4. Adjust weights if needed based on business requirements

