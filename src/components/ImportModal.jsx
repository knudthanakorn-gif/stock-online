import React, { useState, useRef } from 'react';
import { useStock } from '../context/StockContext';
import { X, Upload, Download, CheckCircle2, AlertCircle, FileSpreadsheet, Package, Users } from 'lucide-react';
import * as XLSX from 'xlsx';

export const ImportModal = ({ isOpen, onClose }) => {
  const { categories, addProduct, batchImportRequesters, lang } = useStock();

  const [importType, setImportType] = useState('products'); // 'products' or 'requesters'
  const [parsedItems, setParsedItems] = useState([]);
  const [fileName, setFileName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Download Sample Template (Excel .xlsx) without Barcode
  const handleDownloadTemplate = (format = 'xlsx') => {
    if (importType === 'products') {
      const headers = ['name', 'sku', 'category', 'quantity', 'minThreshold', 'unit', 'description'];
      const sampleRow1 = ['เมาส์ไร้สาย Ergonomic', 'SKU-MOUSE-01', 'IT & Electronics', 20, 5, 'ชิ้น', 'เมาส์ไร้สายบลูทูธ'];
      const sampleRow2 = ['กระดาษ A4 80GSM', 'SKU-PAPER-A4', 'Office Supplies', 50, 10, 'รีม', 'กระดาษถ่ายเอกสาร A4'];

      if (format === 'xlsx') {
        const ws = XLSX.utils.aoa_to_sheet([headers, sampleRow1, sampleRow2]);
        ws['!cols'] = [
          { wch: 30 },
          { wch: 18 },
          { wch: 22 },
          { wch: 12 },
          { wch: 16 },
          { wch: 10 },
          { wch: 35 },
        ];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'products_template');
        XLSX.writeFile(wb, 'products_import_template.xlsx');
      } else {
        const csvContent = '\uFEFF' + [headers.join(','), sampleRow1.join(','), sampleRow2.join(',')].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'products_import_template.csv';
        a.click();
        URL.revokeObjectURL(url);
      }
    } else {
      const headers = ['name', 'department', 'position'];
      const sample1 = ['คุณสมชาย มั่นคง', 'แผนก IT / เทคโนโลยีสารสนเทศ', 'Senior System Engineer'];
      const sample2 = ['คุณวิภาวรรณ สุขเจริญ', 'ฝ่ายขายและการตลาด', 'เจ้าหน้าที่ฝ่ายขายอาวุโส'];

      if (format === 'xlsx') {
        const ws = XLSX.utils.aoa_to_sheet([headers, sample1, sample2]);
        ws['!cols'] = [{ wch: 25 }, { wch: 35 }, { wch: 30 }];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'requesters_template');
        XLSX.writeFile(wb, 'requesters_import_template.xlsx');
      } else {
        const csvContent = '\uFEFF' + [headers.join(','), sample1.join(','), sample2.join(',')].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'requesters_import_template.csv';
        a.click();
        URL.revokeObjectURL(url);
      }
    }
  };

  // Handle File Select & Parse (supports both .xlsx, .xls, and .csv)
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
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawRows || rawRows.length === 0) {
          setErrorMsg(lang === 'th' ? 'ไฟล์ไม่มีข้อมูลแถวสินค้า' : 'File contains no data rows');
          return;
        }

        const items = [];
        for (let i = 0; i < rawRows.length; i++) {
          const raw = rawRows[i];
          const cleanRow = {};
          Object.keys(raw).forEach(k => {
            cleanRow[k.trim().toLowerCase()] = raw[k];
          });

          if (importType === 'products') {
            const catStr = String(cleanRow.category || cleanRow['หมวดหมู่'] || '').toLowerCase();
            const matchedCat = categories.find(
              c => c.name.toLowerCase().includes(catStr) || (c.nameTh && c.nameTh.toLowerCase().includes(catStr))
            );

            const prodName = String(cleanRow.name || cleanRow['product name'] || cleanRow['ชื่อสินค้า'] || '').trim();
            if (!prodName && !cleanRow.sku) continue;

            items.push({
              name: prodName || `สินค้า #${i + 1}`,
              sku: String(cleanRow.sku || cleanRow['รหัสสินค้า'] || `SKU-${Math.floor(100000 + Math.random() * 900000)}`).trim(),
              barcode: String(cleanRow.barcode || cleanRow['บาร์โค้ด'] || `885${Math.floor(100000000 + Math.random() * 900000000)}`).trim(),
              category: matchedCat ? matchedCat.id : (categories[0]?.id || ''),
              categoryName: matchedCat ? (matchedCat.nameTh || matchedCat.name) : (categories[0]?.name || 'General'),
              costPrice: Number(cleanRow.costprice || cleanRow['cost price'] || cleanRow['ราคาทุน'] || 0),
              sellingPrice: Number(cleanRow.sellingprice || cleanRow['selling price'] || cleanRow['ราคาขาย'] || 0),
              quantity: Number(cleanRow.quantity || cleanRow['จำนวน'] || 0),
              minThreshold: Number(cleanRow.minthreshold || cleanRow['ขั้นต่ำ'] || 5),
              unit: String(cleanRow.unit || cleanRow['หน่วย'] || 'ชิ้น').trim(),
              image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=400&q=80',
              description: String(cleanRow.description || cleanRow['รายละเอียด'] || '').trim(),
            });
          } else {
            const reqName = String(cleanRow.name || cleanRow['ชื่อ'] || cleanRow['ชื่อผู้เบิก'] || '').trim();
            if (!reqName) continue;
            items.push({
              name: reqName,
              company: String(cleanRow.company || cleanRow['บริษัท'] || 'EXION (THAILAND) COMPANY LIMITED').trim(),
              department: String(cleanRow.department || cleanRow['แผนก'] || cleanRow['ฝ่าย'] || '').trim(),
              position: String(cleanRow.position || cleanRow['ตำแหน่ง'] || '').trim(),
            });
          }
        }

        if (items.length === 0) {
          setErrorMsg(lang === 'th' ? 'ไม่พบข้อมูลที่ถูกต้องในไฟล์' : 'No valid records found in file');
          return;
        }

        setParsedItems(items);
      } catch (err) {
        console.error('File parse error:', err);
        setErrorMsg(lang === 'th' ? 'เกิดข้อผิดพลาดในการอ่านไฟล์ กรุณาตรวจสอบรูปแบบไฟล์ Excel / CSV' : 'Failed to parse Excel / CSV file');
      }
    };
    reader.readAsArrayBuffer(file);
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
                  ? (lang === 'th' ? 'ดาวน์โหลดแม่แบบ Excel / CSV สำหรับอุปกรณ์สำนักงาน' : 'Download Office Assets Template')
                  : (lang === 'th' ? 'ดาวน์โหลดแม่แบบ Excel / CSV รายชื่อผู้เบิก' : 'Download Requesters Template')}
              </h4>
              <p>
                {importType === 'products'
                  ? (lang === 'th' ? 'โครงสร้างมาตรฐาน (เฉพาะข้อมูลอุปกรณ์ ไม่ต้องใส่ราคาขาย/ราคาทุน — ราคาทุนระบุได้ตอนรับเข้าตามใบเสร็จ)' : 'Standard structure without prices (cost price can be specified during stock-in)')
                  : (lang === 'th' ? 'โครงสร้างคอลัมน์มาตรฐานสำหรับรายชื่อพนักงานผู้เบิก' : 'Standard column structure for requesters')}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button className="btn btn-outline btn-sm font-bold" onClick={() => handleDownloadTemplate('xlsx')}>
                <Download size={15} />
                <span>{lang === 'th' ? 'โหลดแม่แบบ Excel (.xlsx)' : 'Download Excel'}</span>
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => handleDownloadTemplate('csv')} title="ดาวน์โหลดไฟล์ CSV">
                <span>.csv</span>
              </button>
            </div>
          </div>

          {/* Step 2: Upload Excel / CSV */}
          <div className="import-step-card card mb-4">
            <div className="step-num">2</div>
            <div className="step-content">
              <h4>{lang === 'th' ? 'เลือกไฟล์ Excel หรือ CSV เพื่ออัปโหลด' : 'Upload Excel or CSV File'}</h4>
              <p>{fileName ? `ไฟล์ที่เลือก: ${fileName}` : (lang === 'th' ? 'รองรับไฟล์ .xlsx, .xls และ .csv' : 'Supports .xlsx, .xls, and .csv')}</p>
            </div>
            <button className="btn btn-primary btn-sm font-bold" onClick={() => fileInputRef.current?.click()}>
              <FileSpreadsheet size={15} />
              <span>{lang === 'th' ? 'เลือกไฟล์ Excel / CSV' : 'Choose File'}</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
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
                          <th>{lang === 'th' ? 'ชื่ออุปกรณ์' : 'Asset Name'}</th>
                          <th>{lang === 'th' ? 'หมวดหมู่' : 'Category'}</th>
                          <th>{lang === 'th' ? 'จำนวนคงเหลือ' : 'Stock Qty'}</th>
                          <th>{lang === 'th' ? 'จุดเตือนใกล้หมด' : 'Min Alert'}</th>
                          <th>{lang === 'th' ? 'รายละเอียด' : 'Description'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedItems.map((item, idx) => (
                          <tr key={idx}>
                            <td>{idx + 1}</td>
                            <td className="font-mono text-xs">{item.sku}</td>
                            <td className="font-semibold">{item.name}</td>
                            <td><span className="cat-chip">{item.categoryName}</span></td>
                            <td><span className="badge badge-success">{item.quantity} {item.unit}</span></td>
                            <td className="text-muted">{item.minThreshold} {item.unit}</td>
                            <td className="text-xs text-muted" style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {item.description || '-'}
                            </td>
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
