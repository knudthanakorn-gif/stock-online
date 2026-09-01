import React, { useState, useEffect } from 'react';
import { StockProvider, useStock } from './context/StockContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { AdminHome } from './components/AdminHome';
import { UserManager } from './components/UserManager';
import { RequesterManager } from './components/RequesterManager';
import { Dashboard } from './components/Dashboard';
import { ProductList } from './components/ProductList';
import { ProductModal } from './components/ProductModal';
import { StockMovementModal } from './components/StockMovementModal';
import { BarcodeModal } from './components/BarcodeModal';
import { ScannerModal } from './components/ScannerModal';
import { ImportModal } from './components/ImportModal';
import { RequisitionQRModal } from './components/RequisitionQRModal';
import { ScanRequisitionModal } from './components/ScanRequisitionModal';
import { RequisitionPage } from './components/RequisitionPage';
import { ApprovalCenter } from './components/ApprovalCenter';
import { StockAudit } from './components/StockAudit';
import { TransactionHistory } from './components/TransactionHistory';
import { CategoryManager } from './components/CategoryManager';
import { SupplierManager } from './components/SupplierManager';
import { Reports } from './components/Reports';
import { Login } from './components/Login';
import { ForceChangePasswordModal } from './components/ForceChangePasswordModal';
import { DepartmentQuotaModal } from './components/DepartmentQuotaModal';
import { NotificationSettingsModal } from './components/NotificationSettingsModal';
import { BackupRestoreModal } from './components/BackupRestoreModal';

const MainLayout = () => {
  const { user } = useStock();

  const [activeTab, setActiveTab] = useState(() => {
    if (user?.role === 'admin') return 'admin-home';
    if (user?.role === 'user') return 'request-qr';
    return 'dashboard';
  });

  const [searchQuery, setSearchQuery] = useState('');

  // Role Guard Effect: Ensure role tab restrictions
  useEffect(() => {
    if (user) {
      if (user.role === 'user') {
        if (activeTab !== 'request-qr') {
          setActiveTab('request-qr');
        }
      } else if (user.role !== 'admin') {
        if (activeTab === 'admin-home' || activeTab === 'users' || activeTab === 'requesters') {
          setActiveTab('dashboard');
        }
      }
    }
  }, [user, activeTab]);

  // Clean document title during printing to prevent browser printing "stock-online"
  useEffect(() => {
    const handleBeforePrint = () => {
      document.title = ' ';
    };
    const handleAfterPrint = () => {
      document.title = 'Stock Online - ระบบจัดการคลังพัสดุและอุปกรณ์สำนักงาน';
    };

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);

  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [movementType, setMovementType] = useState('IN');
  const [selectedProductId, setSelectedProductId] = useState(null);

  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [barcodeProduct, setBarcodeProduct] = useState(null);

  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isRequisitionQRModalOpen, setIsRequisitionQRModalOpen] = useState(false);
  const [isScanRequisitionModalOpen, setIsScanRequisitionModalOpen] = useState(false);

  // Enterprise Feature Modals
  const [isDepartmentQuotaModalOpen, setIsDepartmentQuotaModalOpen] = useState(false);
  const [isNotificationSettingsModalOpen, setIsNotificationSettingsModalOpen] = useState(false);
  const [isBackupRestoreModalOpen, setIsBackupRestoreModalOpen] = useState(false);

  // If user is not logged in, render Login page
  if (!user) {
    return <Login />;
  }

  // Modal Triggers
  const handleOpenAddProduct = () => {
    setProductToEdit(null);
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (product) => {
    setProductToEdit(product);
    setIsProductModalOpen(true);
  };

  const handleOpenStockIn = (productId = null) => {
    if (productId) setSelectedProductId(productId);
    setMovementType('IN');
    setIsMovementModalOpen(true);
  };

  const handleOpenStockOut = (productId = null) => {
    if (productId) setSelectedProductId(productId);
    setMovementType('OUT');
    setIsMovementModalOpen(true);
  };

  const handleOpenBarcode = (product) => {
    setBarcodeProduct(product);
    setIsBarcodeModalOpen(true);
  };

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenStockIn={() => handleOpenStockIn()}
        onOpenStockOut={() => handleOpenStockOut()}
        onOpenScanner={() => setIsScannerModalOpen(true)}
        onOpenScanRequisition={() => setIsScanRequisitionModalOpen(true)}
        onOpenRequisitionQR={() => setIsRequisitionQRModalOpen(true)}
        onOpenDepartmentQuota={() => setIsDepartmentQuotaModalOpen(true)}
        onOpenBackupRestore={() => setIsBackupRestoreModalOpen(true)}
        onOpenNotificationSettings={() => setIsNotificationSettingsModalOpen(true)}
      />

      {/* Main Body */}
      <div className="main-content">
        <Navbar
          searchQuery={searchQuery}
          setSearchQuery={(q) => {
            setSearchQuery(q);
            if (q && activeTab !== 'inventory') {
              setActiveTab('inventory');
            }
          }}
          onOpenRequisitionQR={() => setIsRequisitionQRModalOpen(true)}
          setActiveTab={setActiveTab}
          onOpenNotificationSettings={() => setIsNotificationSettingsModalOpen(true)}
        />

        <main className="page-container">
          {activeTab === 'admin-home' && user.role === 'admin' && (
            <AdminHome
              setActiveTab={setActiveTab}
              onOpenStockIn={() => handleOpenStockIn()}
              onOpenStockOut={() => handleOpenStockOut()}
              onOpenScanner={() => setIsScannerModalOpen(true)}
              onOpenAddProduct={handleOpenAddProduct}
              onOpenDepartmentQuota={() => setIsDepartmentQuotaModalOpen(true)}
              onOpenBackupRestore={() => setIsBackupRestoreModalOpen(true)}
              onOpenNotificationSettings={() => setIsNotificationSettingsModalOpen(true)}
            />
          )}

          {activeTab === 'users' && user.role === 'admin' && <UserManager />}

          {activeTab === 'requesters' && user.role === 'admin' && <RequesterManager />}

          {activeTab === 'dashboard' && (
            <Dashboard
              onOpenStockIn={() => handleOpenStockIn()}
              setSelectedProductId={setSelectedProductId}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'request-qr' && (
            <RequisitionPage />
          )}

          {activeTab === 'approvals' && (
            <ApprovalCenter />
          )}

          {activeTab === 'audit' && (
            <StockAudit />
          )}

          {activeTab === 'inventory' && (
            <ProductList
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onOpenAddModal={handleOpenAddProduct}
              onOpenEditModal={handleOpenEditProduct}
              onOpenBarcodeModal={handleOpenBarcode}
              onOpenStockIn={() => handleOpenStockIn()}
              onOpenStockOut={() => handleOpenStockOut()}
              onOpenImportModal={() => setIsImportModalOpen(true)}
              setSelectedProductId={setSelectedProductId}
            />
          )}

          {activeTab === 'history' && <TransactionHistory />}

          {activeTab === 'categories' && <CategoryManager />}

          {activeTab === 'suppliers' && <SupplierManager />}

          {activeTab === 'reports' && <Reports />}
        </main>
      </div>

      {/* Modals */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        productToEdit={productToEdit}
      />

      <StockMovementModal
        isOpen={isMovementModalOpen}
        onClose={() => setIsMovementModalOpen(false)}
        initialType={movementType}
        preselectedProductId={selectedProductId}
      />

      <BarcodeModal
        isOpen={isBarcodeModalOpen}
        onClose={() => setIsBarcodeModalOpen(false)}
        product={barcodeProduct}
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />

      <RequisitionQRModal
        isOpen={isRequisitionQRModalOpen}
        onClose={() => setIsRequisitionQRModalOpen(false)}
      />

      <ScanRequisitionModal
        isOpen={isScanRequisitionModalOpen}
        onClose={() => setIsScanRequisitionModalOpen(false)}
      />

      {/* Enterprise Feature Modals */}
      <DepartmentQuotaModal
        isOpen={isDepartmentQuotaModalOpen}
        onClose={() => setIsDepartmentQuotaModalOpen(false)}
      />

      <NotificationSettingsModal
        isOpen={isNotificationSettingsModalOpen}
        onClose={() => setIsNotificationSettingsModalOpen(false)}
      />

      <BackupRestoreModal
        isOpen={isBackupRestoreModalOpen}
        onClose={() => setIsBackupRestoreModalOpen(false)}
      />

      {/* Force Change Password on First Login Modal */}
      <ForceChangePasswordModal />
    </div>
  );
};

export default function App() {
  return (
    <StockProvider>
      <MainLayout />
    </StockProvider>
  );
}
