import { jsPDF } from 'jspdf';
import { AKKARAIPATTU_CENTER } from '../data/initialPlaces';
import { getMultiStopDirectionsUrl } from './navigation';

export function exportPlanToPdf(plan, getTimeSlotForStop) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let currentY = 18;

  // Header Banner
  doc.setFillColor(8, 76, 97); // #084C61 Deep Teal
  doc.rect(margin, currentY, pageWidth - (margin * 2), 22, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('DAYSPIRE - AKKARAIPATTU DAY TOUR', margin + 6, currentY + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(230, 240, 245);
  doc.text('Akkaraipattu 25km Zone • One-Day Visit Itinerary', margin + 6, currentY + 16);

  currentY += 30;

  // Tour Title & Date
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(8, 76, 97);
  doc.text(plan.title || 'My Akkaraipattu Day Tour', margin, currentY);

  currentY += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Scheduled Date: ${plan.date || 'Today'}  |  Start Location: Akkaraipattu Reference Origin`, margin, currentY);

  currentY += 10;

  // Summary Metrics Box
  doc.setFillColor(242, 237, 228); // #F2EDE4
  doc.setDrawColor(232, 226, 217);
  doc.roundedRect(margin, currentY, pageWidth - (margin * 2), 16, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(8, 76, 97);
  doc.text(`TOTAL STOPS: ${plan.stops.length} Places`, margin + 6, currentY + 10);
  doc.text(`ESTIMATED ROUTE TRAVEL: ${plan.totalDistanceKm} km`, margin + 65, currentY + 10);
  doc.text('ZONE RADIUS: Within 25 km', margin + 130, currentY + 10);

  currentY += 24;

  // Timeline Stops
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(8, 76, 97);
  doc.text('Day Visit Timeline & Stops Guidance', margin, currentY);

  currentY += 8;

  plan.stops.forEach((stop, index) => {
    // Check if we need a new page
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }

    const timeSlot = getTimeSlotForStop(index, plan.stops.length, stop.name);

    // Stop Card Background
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(220, 215, 205);
    doc.roundedRect(margin, currentY, pageWidth - (margin * 2), 26, 2, 2, 'FD');

    // Step Number Badge
    doc.setFillColor(226, 125, 96); // #E27D60 Terracotta
    doc.roundedRect(margin + 4, currentY + 4, 8, 8, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(`${index + 1}`, margin + 6.8, currentY + 9.5);

    // Stop Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(8, 76, 97);
    const truncatedName = stop.name.length > 55 ? `${stop.name.substring(0, 52)}...` : stop.name;
    doc.text(truncatedName, margin + 15, currentY + 9);

    // Time Slot & Category
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(226, 125, 96);
    doc.text(`Time: ${timeSlot}`, margin + 15, currentY + 15);

    doc.setTextColor(110, 110, 110);
    const detailsLine = `Category: ${stop.category.toUpperCase()}  •  Distance: ${stop.distanceKm} km (${stop.direction})  •  Entry: ${stop.entryFee.displayText}`;
    doc.text(detailsLine, margin + 15, currentY + 20);

    // Address & Quick Guidance
    if (stop.address) {
      const cleanAddr = stop.address.replace(/^[0-9A-Z\+]+\s*,?\s*/, '').split('(')[0].trim();
      if (cleanAddr) {
        doc.setFontSize(7.5);
        doc.setTextColor(140, 140, 140);
        doc.text(`Address: ${cleanAddr}`, margin + 15, currentY + 24);
      }
    }

    currentY += 29;
  });

  // Check for notes / footer space
  if (currentY > 245) {
    doc.addPage();
    currentY = 20;
  }

  // Multi-stop Route Link Section
  doc.setFillColor(242, 237, 228);
  doc.roundedRect(margin, currentY, pageWidth - (margin * 2), 16, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(8, 76, 97);
  doc.text('Google Maps Turn-by-Turn Multi-Stop Route:', margin + 6, currentY + 6.5);

  const googleMapsMultiStopUrl = getMultiStopDirectionsUrl(
    plan.stops,
    AKKARAIPATTU_CENTER.lat,
    AKKARAIPATTU_CENTER.lng
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(0, 102, 204);
  const displayUrl = googleMapsMultiStopUrl.length > 85 ? `${googleMapsMultiStopUrl.substring(0, 85)}...` : googleMapsMultiStopUrl;
  doc.textWithLink(displayUrl, margin + 6, currentY + 11.5, { url: googleMapsMultiStopUrl });

  currentY += 22;

  // Footer note
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(130, 130, 130);
  doc.text('Travel Advisory: Route times are estimated based on typical Akkaraipattu road conditions. Always respect local coastal weather and mosque quiet hours.', margin, currentY);

  // Save the document directly
  const safeFilename = `${(plan.title || 'Akkaraipattu_Day_Tour').replace(/[^a-zA-Z0-9_-]/g, '_')}_Itinerary.pdf`;
  doc.save(safeFilename);
}
