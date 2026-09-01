import React, { useState, useRef } from 'react';
import { useStock } from '../context/StockContext';
import { X, Upload, Download, CheckCircle2, AlertCircle, FileSpreadsheet, Package, Users } from 'lucide-react';

export const ImportModal = ({ isOpen, onClose }) => {
  const { categories, addProduct, batchImportRequesters, lang } = useStock();

  const [importType, setImportType] = useState('products'); // 'products' or 'requesters'
  const [parsedItems, setParsedItems] = useState([]);
  const [fileName, setFileName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Download Sample CSV Template
  const handleDownloadTemplate = () => {
    if (importType === 'products') {
      const headers = ['name', 'sku', 'barcode', 'category', 'costPrice', 'sellingPrice', 'quantity', 'minThreshold', 'unit', 'description'];
      const sampleRow1 = ['เมาส์ไร้สาย Ergonomic', 'SKU-MOUSE-01', '885123456001', 'IT & Electronics', 850, 1490, 20, 5, 'ชิ้น', 'เมาส์ไร้สายบลูทูธ'];
      const sampleRow2 = ['กระดาษ A4 80GSM', 'SKU-PAPER-A4', '885123456002', 'Office Supplies', 110, 165, 50, 10, 'รีม', 'กระดาษถ่ายเอกสาร A4'];

      const csvContent = '\uFEFF' + [headers.join(','), sampleRow1.join(','), sampleRow2.join(',')].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'products_import_template.csv';
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const headers = ['name', 'department', 'position'];
      const sample1 = ['คุณสมชาย มั่นคง', 'แผนก IT / เทคโนโลยีสารสนเทศ', 'Senior System Engineer'];
      const sample2 = ['คุณวิภาวรรณ สุขเจริญ', 'ฝ่ายขายและการตลาด', 'เจ้าหน้าที่ฝ่ายขายอาวุโส'];

      const csvContent = '\uFEFF' + [headers.join(','), sample1.join(','), sample2.join(',')].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'requesters_import_template.csv';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // Helper to parse CSV line respecting quotes
  const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  // Handle File Select & CSV Parse
  const handleFileChange = (e) => {
    setErrorMsg('');
    setSuccessMsg('');
    setParsedItems([]);
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const lines = text.split(/\r\n|\n/).filter(l => l.trim().length > 0);

        if (lines.length <= 1) {
          setErrorMsg(lang === 'th' ? 'ไฟล์ไม่มีข้อมูล' : 'File contains no data rows');
          return;
        }

        const headers = parseCSVLine(lines[0]).map(h => h.replace(/^"|"$/g, '').trim().toLowerCase());
        const items = [];

        for (let i = 1; i < lines.length; i++) {
          const values = parseCSVLine(lines[i]).map(v => v.replace(/^"|"$/g, '').trim());
          if (values.length < 1 || !values[0]) continue;

          const row = {};
          headers.forEach((h, idx) => {
            row[h] = values[idx] || '';
          });

          if (importType === 'products') {
            const catStr = (row.category || '').toLowerCase();
            const matchedCat = categories.find(
              c => c.name.toLowerCase().includes(catStr) || (c.nameTh && c.nameTh.toLowerCase().includes(catStr))
            );

            items.push({
              name: row.name || row['product name'] || row['ชื่อสินค้า'] || `สินค้า #${i}`,
              sku: row.sku || `SKU-${Math.floor(100000 + Math.random() * 900000)}`,
              barcode: row.barcode || `885${Math.floor(100000000 + Math.random() * 900000000)}`,
              category: matchedCat ? matchedCat.id : (categories[0]?.id || ''),
              categoryName: matchedCat ? (matchedCat.nameTh || matchedCat.name) : (categories[0]?.name || 'General'),
              costPrice: Number(row.costprice || row['cost price'] || row['ราคาทุน'] || 0),
              sellingPrice: Number(row.sellingprice || row['selling price'] || row['ราคาขาย'] || 0),
              quantity: Number(row.quantity || row['จำนวน'] || 0),
              minThreshold: Number(row.minthreshold || row['ขั้นต่ำ'] || 5),
              unit: row.unit || row['หน่วย'] || 'ชิ้น',
              image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=400&q=80',
              description: row.description || row['รายละเอียด'] || '',
            });
          } else {
            // Requesters import
            items.push({
              name: row.name || row['ชื่อ'] || row['ชื่อผู้เบิก'] || `ผู้เบิก #${i}`,
              company: row.company || row['บริษัท'] || 'EXION (THAILAND) COMPANY LIMITED',
              department: row.department || row['แผนก'] || row['ฝ่าย'] || '',
              position: row.position || row['ตำแหน่ง'] || '',
            });
          }
        }

        setParsedItems(items);
      } catch (err) {
        setErrorMsg(lang === 'th' ? 'เกิดข้อผิดพลาดในการอ่านไฟล์ CSV' : 'Failed to parse CSV file');
      }
    };
    reader.readAsText(file);
  };

  // Confirm Import
  const handleConfirmImport = () => {
    if (parsedItems.length === 0) return;

    if (importType === 'products') {
      parsedItems.forEach(item => addProduct(item));
      setSuccessMsg(
        lang === 'th'
          ? `🎉 นำเข้าสินค้าจำนวน ${parsedItems.length} รายการสำเร็จ!`
          : `🎉 Successfully imported ${parsedItems.length} products!`
      );
    } else {
      batchImportRequesters(parsedItems);
      setSuccessMsg(
        lang === 'th'
          ? `🎉 นำเข้ารายชื่อผู้เบิกจำนวน ${parsedItems.length} รายการสำเร็จ!`
          : `🎉 Successfully imported ${parsedItems.length} requesters!`
      );
    }
    setParsedItems([]);
    setFileName('');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-lg">
        <div className="modal-header">
          <div className="modal-header-title">
            <Upload color="#2563eb" size={24} />
            <h2>{lang === 'th' ? 'นำเข้าข้อมูลจากไฟล์ CSV / Excel' : 'Import Data from CSV / Excel'}</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {errorMsg && (
            <div className="alert-box alert-danger mb-4">
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="alert-box alert-success mb-4">
              <CheckCircle2 size={18} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Import Mode Selector */}
          <div className="type-toggle-group mb-4">
            <button
              type="button"
              className={`type-tab ${importType === 'products' ? 'active-in' : ''}`}
              onClick={() => {
                setImportType('products');
                setParsedItems([]);
                setFileName('');
              }}
            >
              <Package size={16} />
              {lang === 'th' ? 'นำเข้าสินค้า (Products CSV)' : 'Import Products'}
            </button>

            <button
              type="button"
              className={`type-tab ${importType === 'requesters' ? 'active-in' : ''}`}
              onClick={() => {
                setImportType('requesters');
                setParsedItems([]);
                setFileName('');
              }}
            >
              <Users size={16} />
              {lang === 'th' ? 'นำเข้ารายชื่อผู้เบิก (Requesters CSV)' : 'Import Requesters'}
            </button>
          </div>

          {/* Step 1: Download Template */}
          <div className="import-step-card card mb-4">
            <div className="step-num">1</div>
            <div className="step-content">
              <h4>
                {importType === 'products'
                  ? (lang === 'th' ? 'ดาวน์โหลดแม่แบบ CSV รายการสินค้า' : 'Download Products CSV Template')
                  : (lang === 'th' ? 'ดาวน์โหลดแม่แบบ CSV รายชื่อผู้เบิก' : 'Download Requesters CSV Template')}
              </h4>
              <p>{lang === 'th' ? 'จัดโครงสร้างคอลัมน์มาตรฐานเพื่อการนำเข้าที่สมบูรณ์' : 'Standard column structure for clean importing'}</p>
            </div>
            <button className="btn btn-outline btn-sm" onClick={handleDownloadTemplate}>
              <Download size={15} />
              {lang === 'th' ? 'โหลดตัวอย่าง CSV' : 'Download Template'}
            </button>
          </div>

          {/* Step 2: Upload CSV */}
          <div className="import-step-card card mb-4">
            <div className="step-num">2</div>
            <div className="step-content">
              <h4>{lang === 'th' ? 'เลือกไฟล์ CSV เพื่ออัปโหลด' : 'Upload CSV File'}</h4>
              <p>{fileName ? `ไฟล์ที่เลือก: ${fileName}` : (lang === 'th' ? 'รองรับไฟล์ .csv (UTF-8)' : 'Supports .csv UTF-8 files')}</p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => fileInputRef.current?.click()}>
              <FileSpreadsheet size={15} />
              {lang === 'th' ? 'เลือกไฟล์ CSV' : 'Choose CSV File'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>

          {/* Preview Parsed Table */}
          {parsedItems.length > 0 && (
            <div className="preview-table-wrap mt-4">
              <div className="preview-header mb-2">
                <span className="font-bold text-sm">
                  {lang === 'th' ? `พบลอยข้อมูลพร้อมนำเข้า (${parsedItems.length} รายการ):` : `Parsed Preview (${parsedItems.length} items):`}
                </span>
              </div>

              <div className="table-responsive max-h-60">
                <table className="data-table">
                  {importType === 'products' ? (
                    <>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>SKU</th>
                          <th>{lang === 'th' ? 'ชื่อสินค้า' : 'Product Name'}</th>
                          <th>{lang === 'th' ? 'หมวดหมู่' : 'Category'}</th>
                          <th>{lang === 'th' ? 'ราคาทุน' : 'Cost'}</th>
                          <th>{lang === 'th' ? 'ราคาขาย' : 'Price'}</th>
                          <th>{lang === 'th' ? 'จำนวน' : 'Qty'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedItems.map((item, idx) => (
                          <tr key={idx}>
                            <td>{idx + 1}</td>
                            <td className="font-mono text-xs">{item.sku}</td>
                            <td className="font-semibold">{item.name}</td>
                            <td><span className="cat-chip">{item.categoryName}</span></td>
                            <td>{item.costPrice} ฿</td>
                            <td>{item.sellingPrice} ฿</td>
                            <td><span className="badge badge-success">{item.quantity} {item.unit}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </>
                  ) : (
                    <>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>{lang === 'th' ? 'ชื่อ - นามสกุล ผู้เบิก' : 'Requester Name'}</th>
                          <th>{lang === 'th' ? 'แผนก / ฝ่าย' : 'Department'}</th>
                          <th>{lang === 'th' ? 'ตำแหน่งงาน' : 'Position'}</th>
                          <th>{lang === 'th' ? 'รหัสพนักงาน' : 'Employee ID'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedItems.map((item, idx) => (
                          <tr key={idx}>
                            <td>{idx + 1}</td>
                            <td className="font-semibold">{item.name}</td>
                            <td><span className="badge badge-info">{item.department || '-'}</span></td>
                            <td>{item.position || '-'}</td>
                            <td className="font-mono text-xs">{item.employeeId || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </>
                  )}
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            {lang === 'th' ? 'ปิด' : 'Close'}
          </button>
          {parsedItems.length > 0 && (
            <button className="btn btn-success" onClick={handleConfirmImport}>
              <CheckCircle2 size={16} />
              {lang === 'th' ? `ยืนยันนำเข้าข้อมูล (${parsedItems.length} รายการ)` : `Confirm Import (${parsedItems.length} items)`}
            </button>
          )}
        </div>
      </div>

      <style>{`
        .modal-lg { max-width: 680px; }

        .import-step-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.25rem;
        }

        .step-num {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--primary-600);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.9rem;
          flex-shrink: 0;
        }

        .step-content {
          flex: 1;
        }

        .step-content h4 {
          font-size: 0.95rem;
          font-weight: 600;
          margin-bottom: 0.15rem;
        }

        .step-content p {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .alert-success {
          background: var(--success-bg);
          color: var(--success-text);
          border: 1px solid var(--success-border);
        }

        .type-toggle-group {
          display: flex;
          gap: 0.5rem;
          background: var(--bg-main);
          padding: 0.3rem;
          border-radius: var(--radius-sm);
        }

        .type-tab {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          padding: 0.6rem;
          border: none;
          background: transparent;
          font-family: var(--font-family);
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--text-muted);
          cursor: pointer;
          border-radius: var(--radius-sm);
          transition: all 0.15s ease;
        }

        .type-tab.active-in {
          background: var(--primary-600);
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
        }

        .max-h-60 { max-height: 240px; overflow-y: auto; }
        .mb-2 { margin-bottom: 0.5rem; }
        .mb-4 { margin-bottom: 1rem; }
        .mt-4 { margin-top: 1rem; }
        .font-mono { font-family: monospace; }
        .text-xs { font-size: 0.75rem; }
        .text-sm { font-size: 0.88rem; }
        .font-bold { font-weight: 700; }
      `}</style>
    </div>
  );
};
