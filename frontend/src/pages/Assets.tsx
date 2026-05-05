import React, { useEffect, useState, useRef } from 'react';
import { assetService } from '../services';
import { Plus, Search, Edit, Trash2, Download, Upload } from 'lucide-react';
import { AssetModal } from '../components/AssetModal';
import '../pages/Tickets.css';

export const Assets: React.FC = () => {
    const [assets, setAssets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState<any | null>(null);
    const [importing, setImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadAssets();
    }, []);

    const loadAssets = async () => {
        try {
            const response = await assetService.getAll();
            setAssets(response.data);
        } catch (error) {
            console.error('Erro ao carregar ativos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAsset = () => {
        setSelectedAsset(null);
        setShowModal(true);
    };

    const handleEditAsset = (asset: any) => {
        setSelectedAsset(asset);
        setShowModal(true);
    };

    const handleDeleteAsset = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja excluir este ativo?')) return;

        try {
            await assetService.delete(id);
            loadAssets();
        } catch (error) {
            console.error('Erro ao excluir ativo:', error);
            alert('Erro ao excluir ativo');
        }
    };

    const handleSave = () => {
        loadAssets();
    };

    const handleExport = async () => {
        try {
            await assetService.exportExcel();
        } catch (error) {
            console.error('Erro ao exportar ativos:', error);
            alert('Erro ao exportar ativos');
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setImporting(true);
        try {
            const result = await assetService.importExcel(file);

            if (result.data.errors.length > 0) {
                const errorMsg = result.data.errors.map((e: any) =>
                    `Linha ${e.row}: ${e.error}`
                ).join('\n');
                alert(`Importação concluída com erros:\n\n${errorMsg}`);
            } else {
                alert(result.message);
            }

            loadAssets();
        } catch (error: any) {
            console.error('Erro ao importar ativos:', error);
            alert(error.response?.data?.message || 'Erro ao importar ativos');
        } finally {
            setImporting(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const filteredAssets = assets.filter(asset =>
        asset.assetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="loading-container"><div className="spinner"></div><p>Carregando ativos...</p></div>;
    }

    return (
        <div className="tickets-page">
            <div className="page-header">
                <div>
                    <h1>Gestão de Ativos</h1>
                    <p>{filteredAssets.length} ativo(s) encontrado(s)</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn-secondary" onClick={handleExport}>
                        <Download size={20} />
                        Exportar Excel
                    </button>
                    <button className="btn-secondary" onClick={handleImportClick} disabled={importing}>
                        <Upload size={20} />
                        {importing ? 'Importando...' : 'Importar Excel'}
                    </button>
                    <button className="btn-primary" onClick={handleCreateAsset}>
                        <Plus size={20} />
                        Novo Ativo
                    </button>
                </div>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />

            <div className="tickets-toolbar">
                <div className="search-box">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Buscar ativos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="tickets-table-container">
                <table className="tickets-table">
                    <thead>
                        <tr>
                            <th>ID do Ativo</th>
                            <th>Descrição</th>
                            <th>Localização</th>
                            <th>Status</th>
                            <th>Responsável</th>
                            <th>Data de Aquisição</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAssets.map((asset) => (
                            <tr key={asset._id}>
                                <td><strong>{asset.assetId}</strong></td>
                                <td>{asset.description}</td>
                                <td>{asset.location || 'N/A'}</td>
                                <td>
                                    <span className="status-badge" style={{
                                        backgroundColor:
                                            asset.status === 'ativo' ? '#10b981' :
                                                asset.status === 'disponivel' ? '#3b82f6' :
                                                    asset.status === 'em_manutencao' ? '#f59e0b' : '#64748b'
                                    }}>
                                        {asset.status}
                                    </span>
                                </td>
                                <td>{asset.assignedTo?.name || 'Não atribuído'}</td>
                                <td>{asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString('pt-BR') : 'N/A'}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            className="btn-icon"
                                            onClick={() => handleEditAsset(asset)}
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            className="btn-icon danger"
                                            onClick={() => handleDeleteAsset(asset._id)}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <AssetModal
                    asset={selectedAsset}
                    onClose={() => setShowModal(false)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

