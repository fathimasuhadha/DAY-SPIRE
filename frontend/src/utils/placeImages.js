import grandMosqueImg from '../assets/images/grand_mosque_akkaraipattu_1788114581709.jpg';
import sinnaMuhattuvaramImg from '../assets/images/sinna_muhattuvaram_estuary_1788114979728.jpg';
import kingsRestaurantImg from '../assets/images/kings_restaurant_akkaraipattu_1788115262013.jpg';
import elephantParkImg from '../assets/images/elephant_park_kaliodai_1788115543053.jpg';
import oluvilLighthouseImg from '../assets/images/oluvil_lighthouse_beach_photo_1788157814636.jpg';
import waterParkImg from '../assets/images/akkaraipattu_water_park_1788157991000_1788158884621.jpg';
import basketBazaarImg from '../assets/images/basket_bazaar_shop_front_1788165563732.jpg';
import karadiKulamImg from '../assets/images/karadi_kulam_waterfall_1788166284297.jpg';
import seuslCampusImg from '../assets/images/seusl_oluvil_campus_monument_1788166745921.jpg';
import colomboFashionImg from '../assets/images/colombo_fashion_akkaraipattu_storefront_1788167146523.jpg';

const sagamamDamImg = 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80';

export {
  grandMosqueImg,
  sinnaMuhattuvaramImg,
  kingsRestaurantImg,
  elephantParkImg,
  oluvilLighthouseImg,
  waterParkImg,
  basketBazaarImg,
  karadiKulamImg,
  seuslCampusImg,
  colomboFashionImg,
  sagamamDamImg,
};

/**
 * Robust image resolver based strictly on Place Name keywords.
 * Never scrambles regardless of place IDs, MongoDB sequence, distance, or sorting orders!
 */
export function getVerifiedPlaceImage(place) {
  if (!place) return sinnaMuhattuvaramImg;

  // 1. If admin uploaded custom base64 or blob image, preserve it immediately
  const currentImg = typeof place.image === 'string' ? place.image : '';
  if (currentImg && (currentImg.startsWith('data:image/') || currentImg.startsWith('blob:'))) {
    return currentImg;
  }

  const n = (place.name || '').toLowerCase();

  // 2. Match strictly by verified place name keywords (Never using brittle ID matching!)
  if (n.includes('water park')) {
    return waterParkImg;
  }
  if (n.includes('basket bazaar')) {
    return basketBazaarImg;
  }
  if (n.includes('colombo fashion')) {
    return colomboFashionImg;
  }
  if (n.includes('kings')) {
    return kingsRestaurantImg;
  }
  if (n.includes('mosque') || n.includes('masjid') || n.includes('jummah') || n.includes('grand')) {
    return grandMosqueImg;
  }
  if (n.includes('university') || n.includes('seusl')) {
    return seuslCampusImg;
  }
  if (n.includes('lighthouse') || (n.includes('oluvil') && !n.includes('university'))) {
    return oluvilLighthouseImg;
  }
  if (n.includes('elephant') || n.includes('aliya') || n.includes('kaliodai')) {
    return elephantParkImg;
  }
  if (n.includes('karadi') || n.includes('kulam') || n.includes('waterfall') || n.includes('cascade')) {
    return karadiKulamImg;
  }
  if (n.includes('sinna') || n.includes('muhattuvaram') || n.includes('alayadivembu') || n.includes('beach')) {
    return sinnaMuhattuvaramImg;
  }
  if (n.includes('sagamam')) {
    return sagamamDamImg;
  }

  // 3. Fallback to existing image or beach
  return place.image || sinnaMuhattuvaramImg;
}