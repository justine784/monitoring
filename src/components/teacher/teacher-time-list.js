'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { firebaseDb } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, XCircle, Calendar, Search, Filter, Download, ChevronLeft, ChevronRight } from 'lucide-react';

export default function TeacherTimeList({ teacherId }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);

  useEffect(() => {
    loadTimeRecords();
  }, [selectedDate, teacherId]);

  const loadTimeRecords = async () => {
    try {
      setLoading(true);
      
      // Get today's records
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      // Simple query by userId to avoid index requirement
      const timeRecordsQuery = query(
        collection(firebaseDb, 'timeRecords'),
        where('userId', '==', teacherId),
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(timeRecordsQuery);
      const recordsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      }));

      // Filter records for selected date on client side
      const filteredRecords = recordsData.filter(record => {
        const recordDate = record.timestamp;
        return recordDate >= startOfDay && recordDate <= endOfDay;
      });

      setRecords(filteredRecords);
      setCurrentPage(1); // Reset to first page when date changes
      
    } catch (err) {
      console.error('Failed to load time records:', err);
      setError('Failed to load time records');
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = !searchTerm || 
      record.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const paginatedRecords = filteredRecords.slice(startIndex, startIndex + recordsPerPage);

  const getStatusIcon = (type) => {
    switch (type) {
      case 'check-in':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'check-out':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (type) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1";
    switch (type) {
      case 'check-in':
        return `${baseClasses} bg-green-100 text-green-700`;
      case 'check-out':
        return `${baseClasses} bg-red-100 text-red-700`;
      default:
        return `${baseClasses} bg-yellow-100 text-yellow-700`;
    }
  };

  const exportToPDF = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    // Generate HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Time Records List - ${selectedDate}</title>
        <style>
          @page {
            size: A4;
            margin: 15mm;
            @bottom-center {
              content: "Page " counter(page);
              font-size: 10px;
              color: #666;
            }
          }
          
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0;
            padding: 0;
            color: #1f2937;
            line-height: 1.5;
            background: white;
          }
          
          .container {
            max-width: 100%;
            margin: 0 auto;
          }
          
          .header { 
            text-align: center; 
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #4f46e5;
            background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%);
            padding: 30px 20px;
            border-radius: 0 0 20px 20px;
          }
          
          .logo-section {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 20px;
            margin-bottom: 20px;
          }
          
          .logo {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            border: 3px solid #4f46e5;
            display: flex;
            align-items: center;
            justify-content: center;
            background: white;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(79, 70, 229, 0.1);
          }
          
          .logo img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          
          .university-info {
            text-align: left;
          }
          
          .header h1 { 
            color: #1e293b; 
            margin: 0;
            font-size: 32px;
            font-weight: 700;
            letter-spacing: -0.5px;
          }
          
          .header h2 { 
            color: #4f46e5; 
            margin: 8px 0 0 0;
            font-size: 20px;
            font-weight: 600;
          }
          
          .header p { 
            color: #64748b; 
            margin: 4px 0;
            font-size: 14px;
          }
          
          .table-section {
            margin: 30px 0;
          }
          
          .table-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
          }
          
          .table-title {
            font-size: 18px;
            font-weight: 600;
            color: #1e293b;
          }
          
          .record-count {
            background: #4f46e5;
            color: white;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
          }
          
          table { 
            width: 100%; 
            border-collapse: collapse; 
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          }
          
          th { 
            background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); 
            color: white;
            font-weight: 600;
            padding: 15px 12px;
            text-align: left;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          td { 
            padding: 12px;
            text-align: left;
            font-size: 12px;
            border-bottom: 1px solid #e2e8f0;
            color: #374151;
          }
          
          tr:last-child td {
            border-bottom: none;
          }
          
          tr:nth-child(even) {
            background: #f8fafc;
          }
          
          tr:hover {
            background: #f1f5f9;
          }
          
          .status-badge {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: 4px;
          }
          
          .status-checkin {
            background: #dcfce7;
            color: #16a34a;
          }
          
          .status-checkout {
            background: #fee2e2;
            color: #dc2626;
          }
          
          .footer { 
            margin-top: 40px; 
            text-align: center; 
            font-size: 11px; 
            color: #64748b;
            border-top: 2px solid #e2e8f0;
            padding-top: 20px;
            background: #f8fafc;
            padding: 20px;
            border-radius: 12px;
          }
          
          .footer-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
          }
          
          .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 120px;
            color: #e2e8f0;
            font-weight: bold;
            opacity: 0.1;
            pointer-events: none;
            z-index: -1;
          }
          
          .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .status-checkin {
            background: #dcfce7;
            color: #16a34a;
          }
          
          .status-checkout {
            background: #fee2e2;
            color: #dc2626;
          }
          
          .time-cell {
            white-space: nowrap;
            font-family: 'Courier New', monospace;
          }
        </style>
      </head>
      <body>
        <div class="watermark">MSU</div>
        <div class="container">
          <div class="header">
            <div class="logo-section">
              <div class="logo">
                <img src="https://www.msu.edu.ph/wp-content/uploads/2020/04/MSU-Logo.png" alt="Mindoro State University Logo" />
              </div>
              <div class="university-info">
                <h1>Mindoro State University</h1>
                <h2>Time Records List</h2>
                <p>Date: ${new Date(selectedDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
                <p>Generated on: ${new Date().toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div class="table-section">
            <div class="table-header">
              <div class="table-title">Detailed Time Records</div>
              <div class="record-count">${filteredRecords.length} Records</div>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Timestamp</th>
                  <th>Location</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                ${filteredRecords.map(record => `
                  <tr>
                    <td>
                      <span class="status-badge ${record.type === 'check-in' ? 'status-checkin' : 'status-checkout'}">
                        ${record.type === 'check-in' ? '✓' : '✗'}
                        ${record.type ? record.type.toUpperCase() : 'N/A'}
                      </span>
                    </td>
                    <td class="time-cell">${record.timestamp.toLocaleString()}</td>
                    <td>${record.location || 'N/A'}</td>
                    <td>${record.reason || 'N/A'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="footer">
            <div class="footer-row">
              <div>
                <strong>Mindoro State University</strong><br>
                Bongabong Campus, Oriental Mindoro, Philippines
              </div>
              <div>
                <strong>MSU Monitoring System</strong><br>
                Generated on ${new Date().toLocaleDateString()}
              </div>
            </div>
            <div style="text-align: center; margin-top: 15px;">
              This report contains ${filteredRecords.length} time records for ${selectedDate}<br>
              © 2024 Mindoro State University - All Rights Reserved
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Write content to new window
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load, then print
    printWindow.onload = function() {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    };
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by location, reason, or type..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={exportToPDF}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Records Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <Clock className="w-5 h-5 text-blue-600" />
                Time Records List
              </CardTitle>
              <p className="text-sm text-slate-600">View all your check-in and check-out records</p>
            </div>
            <div className="text-sm text-slate-500">
              {filteredRecords.length} records found
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-sm text-slate-600">Loading time records...</span>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">
                {searchTerm || selectedDate !== new Date().toISOString().split('T')[0] 
                  ? 'No records found matching your criteria.' 
                  : 'No time records found for this date.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Type
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Timestamp
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        Location
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Reason
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {paginatedRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={getStatusBadge(record.type)}>
                          {getStatusIcon(record.type)}
                          <span>{record.type ? record.type.toUpperCase() : 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900 font-mono">
                          {record.timestamp.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-600">{record.location || 'N/A'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-600">{record.reason || 'N/A'}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className="w-8 h-8 p-0"
              >
                {page}
              </Button>
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
