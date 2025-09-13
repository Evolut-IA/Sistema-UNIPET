-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.chat_settings (
  id character varying NOT NULL DEFAULT gen_random_uuid(),
  welcome_message text NOT NULL DEFAULT 'Olá! Como posso te ajudar hoje?'::text,
  bot_icon text,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  updated_at timestamp without time zone NOT NULL DEFAULT now(),
  placeholder_text text NOT NULL DEFAULT 'Digite sua mensagem...'::text,
  chat_title text NOT NULL DEFAULT 'Atendimento Virtual'::text,
  button_icon text NOT NULL DEFAULT 'MessageCircle'::text,
  user_icon text,
  chat_position text NOT NULL DEFAULT 'bottom-right'::text,
  chat_size text NOT NULL DEFAULT 'md'::text,
  is_enabled boolean NOT NULL DEFAULT true,
  CONSTRAINT chat_settings_pkey PRIMARY KEY (id)
);
CREATE TABLE public.clients (
  id character varying NOT NULL DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text,
  phone text NOT NULL,
  cpf text NOT NULL UNIQUE,
  cep text,
  address text,
  number text,
  complement text,
  district text,
  state text,
  city text,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT clients_pkey PRIMARY KEY (id)
);
CREATE TABLE public.contact_submissions (
  id character varying NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  city text NOT NULL,
  pet_name text NOT NULL,
  animal_type text NOT NULL,
  pet_age text NOT NULL,
  plan_interest text NOT NULL,
  message text,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT contact_submissions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.faq_items (
  id character varying NOT NULL DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  display_order integer NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT faq_items_pkey PRIMARY KEY (id)
);
CREATE TABLE public.guides (
  id character varying NOT NULL DEFAULT gen_random_uuid(),
  client_id character varying NOT NULL,
  pet_id character varying NOT NULL,
  type text NOT NULL,
  procedure text NOT NULL,
  procedure_notes text,
  general_notes text,
  value numeric,
  status text DEFAULT 'open'::text,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT guides_pkey PRIMARY KEY (id),
  CONSTRAINT guides_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id),
  CONSTRAINT guides_pet_id_fkey FOREIGN KEY (pet_id) REFERENCES public.pets(id)
);
CREATE TABLE public.network_units (
  id character varying NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  phone text NOT NULL,
  services ARRAY NOT NULL,
  image_url text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  whatsapp text,
  google_maps_url text,
  image_data text,
  CONSTRAINT network_units_pkey PRIMARY KEY (id)
);
CREATE TABLE public.pets (
  id character varying NOT NULL DEFAULT gen_random_uuid(),
  client_id character varying NOT NULL,
  name text NOT NULL,
  species text NOT NULL,
  breed text,
  birth_date timestamp without time zone,
  age text,
  sex text NOT NULL,
  castrated boolean DEFAULT false,
  color text,
  weight numeric,
  microchip text,
  previous_diseases text,
  surgeries text,
  allergies text,
  current_medications text,
  hereditary_conditions text,
  vaccine_data json DEFAULT '[]'::json,
  last_checkup timestamp without time zone,
  parasite_treatments text,
  plan_id character varying,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pets_pkey PRIMARY KEY (id),
  CONSTRAINT pets_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id),
  CONSTRAINT pets_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.plans(id)
);
CREATE TABLE public.plans (
  id character varying NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text NOT NULL,
  features ARRAY NOT NULL,
  image text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  button_text text NOT NULL DEFAULT 'Contratar Plano'::text,
  display_order integer NOT NULL DEFAULT 0,
  price integer NOT NULL DEFAULT 0,
  plan_type USER-DEFINED NOT NULL DEFAULT 'with_waiting_period'::plan_type_enum,
  CONSTRAINT plans_pkey PRIMARY KEY (id)
);
CREATE TABLE public.site_settings (
  id character varying NOT NULL DEFAULT gen_random_uuid(),
  whatsapp text,
  email text,
  phone text,
  instagram_url text,
  facebook_url text,
  linkedin_url text,
  youtube_url text,
  cnpj text,
  business_hours text,
  our_story text,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  updated_at timestamp without time zone NOT NULL DEFAULT now(),
  privacy_policy text,
  terms_of_use text,
  address text,
  main_image text,
  network_image text,
  about_image text,
  CONSTRAINT site_settings_pkey PRIMARY KEY (id)
);
CREATE TABLE public.users (
  id character varying NOT NULL DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  password text NOT NULL,
  email text NOT NULL UNIQUE,
  role text NOT NULL DEFAULT 'admin'::text,
  permissions json DEFAULT '[]'::json,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  is_active boolean DEFAULT true,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);