CREATE TABLE IF NOT EXISTS public.sabeels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sl_num INT NOT NULL,
    sabeel_name TEXT NOT NULL,
    location TEXT,
    contact_person TEXT,
    contact_num TEXT,
    maps_link TEXT,
    lat FLOAT8,
    lng FLOAT8,
    filters JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Turn on Row Level Security but allow all anonymous users to select (read-only public access)
ALTER TABLE public.sabeels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on sabeels" 
ON public.sabeels FOR SELECT 
USING (true);

-- Allow full access for admin (using service role or bypass)
CREATE POLICY "Allow service role full access on sabeels" 
ON public.sabeels FOR ALL 
USING (true)
WITH CHECK (true);

-- Insert the initial 33 Sabeels from your JSON data
INSERT INTO public.sabeels (sl_num, sabeel_name, location, contact_person, contact_num) VALUES
(1, 'Sabeel E Imam E Hussain (as) 
by Syed Ali Abbas S/o Marhoom Syed Saab Saheb', 'Near Giriyas Showroom & Brigade Tower, Brigade Road', 'Syed Ali Abbas', '87225 51475'),
(2, 'Sabeel E Imam E Hussain(as) 
by Khaleeli Family', 'Bengaluru Golf Club Premises, 
Palace Road,', 'Mohammed 
Zaki Khaleeli', '98450 17425'),
(3, 'Sabeel E Imam E Hussain(as) 
by Family of Late Mir Ahmed Hussain Johari Saheb (Babu)', 'Mekri Circle, Bellary Road, Opp to Palace Ground', 'Imran Rizvi', '87224 77775'),
(4, 'Sabeel E Imam Hussain A.S. 
By Nazir Hussain Family', 'Mekri Circle, 
Next to Bus Stop', 'Meer Arif Hussain', '98868 92900'),
(5, 'Sabeel Nazr e Imam Hussain (A.S) Muntazir e Mehdi (A.S) Committee.', 'Ganga Nagar Opp Four Sessons Hotel Bus Stop', 'Zaki Mirza', '90358 18707'),
(6, 'Sabeel E Imam E Hussain(as) by Aun O Mohammed Committee', 'After Hebbal Flyover, Opp to Esteem Mall, Bellary Road', 'Roshan', '98457 55128'),
(7, 'Sabeel E Hazrath E Abbas (a s)', 'After Hebbal Flyover, Near Signal', 'Nasar Ali', '72041 27272'),
(8, 'Sabeel E Imam E Hussain (a s) 
by Aun O Mohammed Committee', 'Opp to Jakkur Airport', 'Ali Raza / Karar Ali', '98459 48966 
76194 98476'),
(9, 'Sabeel E Sakeena (A.S)', 'Opp to Jakkur Airport', 'Saqlain Sakeena', '99642 38381'),
(10, 'Sabeel E Bibi Sakina (a.s) 
by Asad Fathima (Khuster)', 'Yelahanka police station cross onwards. Mode-Mobile (Car)', 'Dr. Alamdar', '83106 83418'),
(11, 'Sabeel E Imam E Hussain(as) 
by Hazrath Abbas Committee', 'Yelahanka Petrol Bunk, Opp to Indian Oil', 'Syed Shabeer Ali  (BBMP) / Amair Ali / Tawsif Ali /Zaheer /', '99019 79866 
97413 52088  
91413 98098
86607 27562'),
(12, 'Raza E Gareeb Sabeel', 'Near RR Avenues, New Town Yelahanka', 'Irfan Hyder (Abul)', '95910 53474'),
(13, 'Sabeel E Imam E Hussain (a s)', 'Near Rail Wheel Factory Hospital and Quarters', 'Inayath', '98453 08616'),
(14, 'Sabeel E Imam E Hussain (a s) 
By HMI Family', 'Opp Rail Wheel Factory, Yelahanka', 'Mirza Baqar Ali / 
Anees Akhtar (Ex IFI President)', '98805 01034'),
(15, 'Sabeel E Bibi Sakina (s a)', 'Beside B M S IT College Opp. M C Café, Yelhanka', 'Mr. Hassan / 
Mujhtaba', '96863 04581/
76193 14794'),
(16, 'Sabeel E Sakina (s a)', 'Rajankunte Kalyana Mantapa', 'Safeer Hussain', '70191 03062'),
(17, 'Zulfiqar Group', 'Near Rajankunte Bus Stop', 'Abbas Ali', '88612 20993'),
(18, 'Sabeel E Azakhna E Abu Talib a.s.', 'Near Rajankunte', 'Hassan Abbas', '88614 26885'),
(19, 'Sabeel E Imam E Hussain (a s)', 'Rajankunte', 'Tabrezi Family', '98451 52805'),
(20, 'Sabeel Nazr E Imam Hussain (a s) 
by Hazrath Ali Asghar (a s) 
Naunihal Association', '1-1/2Km. Before Toll Palza From B''lore to Dodbalapura', 'Sibtain', '91083 35927'),
(21, 'Karbala Committee', 'Before Toll Plaza', 'Mohammed / Imran / Tanzeem', '98865 78919 / 
99018 43680'),
(22, 'Sabeeel E Madrase Naseeriya Koppal (HNPP)', 'Marasandra Bustop', 'Rahil', '9964660889'),
(23, 'Sabeel E Imam E Hussain(as)', 'Marasandra PWC Apartment', 'Mirza Talib', '95131 76225'),
(24, 'Sabeel E Imam E Hussain (as) 
By Nazr E Hazrath Abbas (as) Committee', 'Before Bastehalli Flyover', 'Mazhar', '96202 27022'),
(25, 'Safeer E Imam Hussain', 'Doddaballapur Railway Station', 'Hyder (Darbar E Hyderi)  / Thasil Abbas', '8722454469 / 99801 18608'),
(26, 'Sabeel E Ghareeb E Hussain (a.s) Mokib e Karbala 
By Syed e Sajjad A.S. Group', '2 KMS Before Rajankunte Toll
Left Side Opp to 
Nayara Petrol Bunk.', 'Shabaz 
Hyder 
Ali Mohammed', '99166 60438 
96635 69803'),
(27, 'Anjuman E Sakina bint Hussain a.s.', 'Bisuvanahalli,  Doddaballapur main road in fort of Government School', 'Touseel Abbas / 
Abbas Ali', '74069 15231 
 96638 50504'),
(28, 'Mobile Sabeel E Imam Hussain(as) in Car By Mody Family', 'From Bangalore to Doddaballapur', 'Azeem Mody', '99162 963305'),
(29, 'Mobile Sabeel E Imam Hussain(as) in Car 
By Syed Ismail (Nanu) Sunni Brother', 'From Yelahanka to Doddaballapur', 'Syed Ismail (Nanu) Sunni Brother', '98450 09844'),
(30, 'Mobile Car Service (Snacks Juice, Medicine & Patrolling)', 'From Bangalore to Doddaballapur & From Alipur to Doddaballapur', 'Mir Masoom Ali & Sons (YAM Caterers)', '99808 39070'),
(31, 'Sabeel e Baitul Sakina S.A. 
"K.B.H. Tourism presents: Walking Zayreen – Radium Jackets distribute to group leaders only!', 'Near Dodabalapur Bus Stand
(For walking Zayreen pilgrims, a KSRTC bus is arranged for return form Dodbalapur at Govt., price).', 'Mr. Syed Salman Raza', '63615 89143'),
(32, 'Medical Camp by Navachethana Hospital (First Aid, Physiotherapy for Gents & Ladies, Doctor Consultation & Toilet Facilities)', 'Yelahanka New Town, Opp Railwheel Factory, Doddaballapur Main Road', 'Mir Mohammed Rafi                   Bakhar Abbas', '96863 34568 
81470 21321'),
(33, 'Ambulance Service by Idara E Faizul Islam - 
Neelasandra, Bengaluru', 'Emergency Service', 'Imran Isfahani                                         Vaseem Abbas', '98458 24169 
98455 03685');
