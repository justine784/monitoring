'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, where, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseDb } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Users, Calendar, Search, Filter, CheckCircle, XCircle, AlertCircle, TrendingUp, Download, FileText } from 'lucide-react';

export default function TeacherTimeRecords({ teacherId }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [stats, setStats] = useState({
    totalRecords: 0,
    checkIns: 0,
    checkOuts: 0,
    averageHours: 0
  });

  useEffect(() => {
    loadTimeRecords();
  }, [selectedDate, teacherId]);

  const loadTimeRecords = async () => {
    try {
      setLoading(true);
      
      // Load time records for selected date - simplified query to avoid index requirement
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      // First query by userId and timestamp range
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

      // Filter records for the selected date on the client side
      const filteredRecords = recordsData.filter(record => {
        const recordDate = record.timestamp;
        return recordDate >= startOfDay && recordDate <= endOfDay;
      });

      setRecords(filteredRecords);
      calculateStats(filteredRecords);
      
    } catch (err) {
      console.error('Failed to load time records:', err);
      setError('Failed to load time records');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (recordsData) => {
    const checkIns = recordsData.filter(r => r.type === 'check-in');
    const checkOuts = recordsData.filter(r => r.type === 'check-out');
    
    // Calculate average hours (simplified - pairs check-ins with check-outs)
    let totalHours = 0;
    let pairedRecords = 0;
    
    for (const checkIn of checkIns) {
      const checkOut = checkOuts.find(co => co.timestamp > checkIn.timestamp);
      if (checkOut) {
        const hours = (checkOut.timestamp - checkIn.timestamp) / (1000 * 60 * 60);
        if (hours > 0 && hours < 24) { // Reasonable hours check
          totalHours += hours;
          pairedRecords++;
        }
      }
    }
    
    const avgHours = pairedRecords > 0 ? totalHours / pairedRecords : 0;
    
    setStats({
      totalRecords: recordsData.length,
      checkIns: checkIns.length,
      checkOuts: checkOuts.length,
      averageHours: avgHours
    });
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = !searchTerm || 
      record.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.userRole?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const getStatusIcon = (type) => {
    switch (type) {
      case 'check-in':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'check-out':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
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
        <title>Time Records - ${selectedDate}</title>
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
          
          .report-info {
            background: #f1f5f9;
            padding: 15px;
            border-radius: 10px;
            margin: 20px 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-left: 4px solid #4f46e5;
          }
          
          .report-info-item {
            text-align: center;
          }
          
          .report-info-label {
            font-size: 12px;
            color: #64748b;
            margin-bottom: 4px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .report-info-value {
            font-size: 16px;
            font-weight: 600;
            color: #1e293b;
          }
          
          .stats { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 30px;
            gap: 15px;
          }
          
          .stat-card { 
            flex: 1;
            text-align: center; 
            padding: 20px 15px;
            background: white;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            transition: transform 0.2s;
          }
          
          .stat-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
          
          .stat-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 10px;
            font-size: 18px;
            font-weight: bold;
          }
          
          .stat-icon.records {
            background: #dbeafe;
            color: #2563eb;
          }
          
          .stat-icon.checkin {
            background: #dcfce7;
            color: #16a34a;
          }
          
          .stat-icon.checkout {
            background: #fee2e2;
            color: #dc2626;
          }
          
          .stat-icon.hours {
            background: #f3e8ff;
            color: #9333ea;
          }
          
          .stat-number { 
            font-size: 28px; 
            font-weight: 700; 
            color: #1e293b;
            margin-bottom: 5px;
          }
          
          .stat-label { 
            font-size: 12px; 
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
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
            border: 1px solid #4f46e5;
          }
          
          td { 
            padding: 15px 12px;
            text-align: left;
            font-size: 12px;
            border-bottom: 1px solid #e2e8f0;
            color: #374151;
            vertical-align: top;
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
          
          .user-name {
            font-weight: 600;
            color: #1e293b;
            white-space: nowrap;
          }
          
          .location {
            max-width: 200px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          
          .time-cell {
            white-space: nowrap;
            font-family: 'Courier New', monospace;
          }
          
          .type-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .type-checkin {
            background: #dcfce7;
            color: #16a34a;
          }
          
          .type-checkout {
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
          
          @media print {
            body { margin: 10px; }
            .container { width: 100%; }
            .watermark { opacity: 0.05; }
          }
        </style>
      </head>
      <body>
        <div class="watermark">MSU</div>
        <div class="container">
          <div class="header">
            <div class="logo-section">
              <div class="logo">
                <img src="https://www.msu.edu.ph/wp-content/uploads/2020/04/MSU-Logo.png" alt="MSU Logo" />
              </div>
              <div class="university-info">
                <h1>Mindoro State University</h1>
                <h2>Teacher Time Records Report</h2>
                <p>Date: ${new Date(selectedDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
                <p>Generated on: ${new Date().toLocaleString()}</p>
              </div>
            </div>
            
            <div class="report-info">
              <div class="report-info-item">
                <div class="report-info-label">Report Date</div>
                <div class="report-info-value">${new Date(selectedDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</div>
              </div>
              <div class="report-info-item">
                <div class="report-info-label">Generated</div>
                <div class="report-info-value">${new Date().toLocaleString()}</div>
              </div>
              <div class="report-info-item">
                <div class="report-info-label">Report Type</div>
                <div class="report-info-value">Time Records</div>
              </div>
            </div>
          </div>

          <div class="stats">
            <div class="stat-card">
              <div class="stat-icon records">
                📊
              </div>
              <div class="stat-number">${stats.totalRecords}</div>
              <div class="stat-label">Total Records</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon checkin">
                ✓
              </div>
              <div class="stat-number">${stats.checkIns}</div>
              <div class="stat-label">Check-ins</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon checkout">
                ✗
              </div>
              <div class="stat-number">${stats.checkOuts}</div>
              <div class="stat-label">Check-outs</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon hours">
                ⏱
              </div>
              <div class="stat-number">${stats.averageHours.toFixed(1)}</div>
              <div class="stat-label">Avg Hours</div>
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
                      <div class="${getStatusBadge(record.type)}">
                        ${getStatusIcon(record.type)}
                        <span>${record.type ? record.type.toUpperCase() : 'N/A'}</span>
                      </div>
                    </td>
                    <td class="time-cell">${record.timestamp.toLocaleString()}</td>
                    <td class="location">${record.location || 'N/A'}</td>
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

    // Write content to the new window
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
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">Total Records</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalRecords}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-900">Check-ins</p>
                <p className="text-2xl font-bold text-green-600">{stats.checkIns}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-50 to-rose-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-red-900">Check-outs</p>
                <p className="text-2xl font-bold text-red-600">{stats.checkOuts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-900">Avg Hours</p>
                <p className="text-2xl font-bold text-purple-600">{stats.averageHours.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Records Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <Clock className="w-5 h-5 text-purple-600" />
                My Time Records
              </CardTitle>
              <p className="text-sm text-slate-600">View and export your check-in/check-out history</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportToPDF}
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Export PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Date Selection */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  placeholder="Search by location or reason..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Records Table */}
          <div className="overflow-x-auto">
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
                      Timestamp
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Location
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Reason
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredRecords.map((record) => (
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-slate-600">{record.location || 'N/A'}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-slate-600">{record.reason || 'N/A'}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
