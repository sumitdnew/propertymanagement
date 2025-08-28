-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  apartment TEXT,
  user_type TEXT DEFAULT 'tenant' CHECK(user_type IN ('tenant', 'property-manager', 'building-owner', 'business-owner')),
  building_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create buildings table
CREATE TABLE public.buildings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  description TEXT,
  security_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create business_categories table
CREATE TABLE public.business_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT DEFAULT '#3B82F6',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create businesses table
CREATE TABLE public.businesses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category_id UUID REFERENCES public.business_categories(id),
  description TEXT,
  address TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  website TEXT,
  hours TEXT,
  latitude REAL,
  longitude REAL,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create business_reviews table
CREATE TABLE public.business_reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
  comment TEXT,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected', 'flagged')),
  is_verified BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  spam_score REAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create review_photos table
CREATE TABLE public.review_photos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  review_id UUID REFERENCES public.business_reviews(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create review_responses table
CREATE TABLE public.review_responses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  review_id UUID REFERENCES public.business_reviews(id) ON DELETE CASCADE,
  business_id UUID REFERENCES public.businesses(id),
  responder_id UUID REFERENCES public.profiles(id),
  response TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create review_votes table
CREATE TABLE public.review_votes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  review_id UUID REFERENCES public.business_reviews(id) ON DELETE CASCADE,
  voter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK(vote_type IN ('helpful', 'not_helpful')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(review_id, voter_id)
);

-- Create review_reports table
CREATE TABLE public.review_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  review_id UUID REFERENCES public.business_reviews(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'investigating', 'resolved', 'dismissed')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES public.profiles(id)
);

-- Create review_notifications table
CREATE TABLE public.review_notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id),
  user_id UUID REFERENCES public.profiles(id),
  type TEXT NOT NULL CHECK(type IN ('new_review', 'review_response', 'review_report', 'review_approved', 'review_rejected')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  related_review_id UUID REFERENCES public.business_reviews(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create maintenance_requests table
CREATE TABLE public.maintenance_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  requester_id UUID REFERENCES public.profiles(id),
  building_id UUID REFERENCES public.buildings(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  assigned_to UUID REFERENCES public.profiles(id),
  estimated_cost REAL,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create community_posts table
CREATE TABLE public.community_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  author_id UUID REFERENCES public.profiles(id),
  building_id UUID REFERENCES public.buildings(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  post_type TEXT DEFAULT 'general' CHECK(post_type IN ('general', 'announcement', 'event', 'question')),
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE public.payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id UUID REFERENCES public.profiles(id),
  building_id UUID REFERENCES public.buildings(id),
  apartment TEXT NOT NULL,
  amount REAL NOT NULL,
  payment_type TEXT DEFAULT 'rent' CHECK(payment_type IN ('rent', 'utilities', 'maintenance', 'other')),
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'paid', 'overdue', 'cancelled')),
  payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create invitations table
CREATE TABLE public.invitations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  inviter_id UUID REFERENCES public.profiles(id),
  building_id UUID REFERENCES public.buildings(id),
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'expired')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create groups table
CREATE TABLE public.groups (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  building_id UUID REFERENCES public.buildings(id),
  created_by UUID REFERENCES public.profiles(id),
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create group_members table
CREATE TABLE public.group_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK(role IN ('member', 'moderator', 'admin')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Create group_posts table
CREATE TABLE public.group_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_profiles_user_type ON public.profiles(user_type);
CREATE INDEX idx_profiles_building_id ON public.profiles(building_id);
CREATE INDEX idx_businesses_status ON public.businesses(status);
CREATE INDEX idx_businesses_category_id ON public.businesses(category_id);
CREATE INDEX idx_businesses_location ON public.businesses(latitude, longitude);
CREATE INDEX idx_business_reviews_business_id ON public.business_reviews(business_id);
CREATE INDEX idx_business_reviews_status ON public.business_reviews(status);
CREATE INDEX idx_business_reviews_rating ON public.business_reviews(rating);
CREATE INDEX idx_maintenance_requests_building_id ON public.maintenance_requests(building_id);
CREATE INDEX idx_maintenance_requests_status ON public.maintenance_requests(status);
CREATE INDEX idx_community_posts_building_id ON public.community_posts(building_id);
CREATE INDEX idx_payments_tenant_id ON public.payments(tenant_id);
CREATE INDEX idx_payments_status ON public.payments(status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_posts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles: Users can only see their own profile and profiles in their building
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view profiles in their building" ON public.profiles
  FOR SELECT USING (
    building_id IN (
      SELECT building_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Buildings: Users can only see buildings they're part of
CREATE POLICY "Users can view their building" ON public.buildings
  FOR SELECT USING (
    id IN (
      SELECT building_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Businesses: Public read access for approved businesses, owners can manage their own
CREATE POLICY "Public can view approved businesses" ON public.businesses
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Business owners can manage their business" ON public.businesses
  FOR ALL USING (owner_id = auth.uid());

-- Business reviews: Public read access for approved reviews, reviewers can manage their own
CREATE POLICY "Public can view approved reviews" ON public.business_reviews
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Reviewers can manage their reviews" ON public.business_reviews
  FOR ALL USING (reviewer_id = auth.uid());

-- Insert sample business categories
INSERT INTO public.business_categories (name, description, icon, color, sort_order) VALUES
('Restaurants', 'Food and dining establishments', 'utensils', '#EF4444', 1),
('Retail', 'Shopping and retail stores', 'shopping-bag', '#3B82F6', 2),
('Services', 'Professional and business services', 'briefcase', '#10B981', 3),
('Healthcare', 'Medical and health services', 'heart-pulse', '#F59E0B', 4),
('Entertainment', 'Entertainment and leisure', 'music', '#8B5CF6', 5),
('Cleaning', 'Cleaning and maintenance services', 'sparkles', '#06B6D4', 6),
('Plumbing', 'Plumbing and repair services', 'wrench', '#84CC16', 7),
('Grocery', 'Grocery and convenience stores', 'shopping-cart', '#F97316', 8),
('Pharmacy', 'Pharmacy and drug stores', 'pill', '#EC4899', 9),
('Beauty', 'Beauty and personal care', 'scissors', '#A855F7', 10),
('Fitness', 'Fitness and wellness centers', 'dumbbell', '#14B8A6', 11),
('Other', 'Other business categories', 'more-horizontal', '#6B7280', 12);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, user_type)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'name', NEW.email, 'tenant');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_reviews_updated_at BEFORE UPDATE ON public.business_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_maintenance_requests_updated_at BEFORE UPDATE ON public.maintenance_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_posts_updated_at BEFORE UPDATE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON public.groups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_group_posts_updated_at BEFORE UPDATE ON public.group_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
