import React, { useState, useEffect } from 'react';
import { assetService } from '../services';
import { X } from 'lucide-react';
import './TicketModal.css'; // Reutilizando estilos do modal

interface AssetModalProps {
    asset: any | null;
    onClose: () => void;
    onSave: () => void;
}

export const AssetModal: React.FC<AssetModalProps> = ({ asset, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        assetId: '',
        description: '',
        type: 'notebook',
        brand: '',
        model: '',
        serialNumber: '',
        purchaseDate: '',
        warrantyExpiration: '',
        status: 'ativo',
        location: '',
        assignedTo: '' // ID do usuário (opcional)
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (asset) {
            setFormData({
                assetId: asset.assetId || '',
                description: asset.description || '',
                type: asset.type || 'notebook',
                brand: asset.brand || '',
                model: asset.model || '',
                serialNumber: asset.serialNumber || '',
                purchaseDate: asset.purchaseDate ? asset.purchaseDate.split('T')[0] : '',
                warrantyExpiration: asset.warrantyExpiration ? asset.warrantyExpiration.split('T')[0] : '',
                status: asset.status || 'ativo',
                location: asset.location || '',
                assignedTo: asset.assignedTo?._id || asset.assignedTo || ''
            });
        }
    }, [asset]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const dataToSend: any = { ...formData };

            // Limpar campos de data vazios
            if (!dataToSend.purchaseDate) delete dataToSend.purchaseDate;
            if (!dataToSend.warrantyExpiration) delete dataToSend.warrantyExpiration;
            if (!dataToSend.assignedTo) delete dataToSend.assignedTo;

            if (asset) {
                await assetService.update(asset._id, dataToSend);
            } else {
                await assetService.create(dataToSend);
            }

            onSave();
            onClose();
        } catch (error) {
            console.error('Erro ao salvar ativo:', error);
            alert('Erro ao salvar ativo');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{asset ? 'Editar Ativo' : 'Novo Ativo'}</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body">
                    <div className="form-grid">
                        <div className="form-group">
                            <label>ID do Ativo (Patrimônio) *</label>
                            <input
                                type="text"
                                value={formData.assetId}
                                onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                                required
                                placeholder="Ex: NB-001"
                            />
                        </div>

                        <div className="form-group">
                            <label>Tipo *</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                required
                            >
                                <option value="notebook">Notebook</option>
                                <option value="desktop">Desktop</option>
                                <option value="monitor">Monitor</option>
                                <option value="impressora">Impressora</option>
                                <option value="servidor">Servidor</option>
                                <option value="rede">Equipamento de Rede</option>
                                <option value="periferico">Periférico</option>
                                <option value="software">Software</option>
                                <option value="outro">Outro</option>
                            </select>
                        </div>

                        <div className="form-group full-width">
                            <label>Descrição *</label>
                            <input
                                type="text"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                                placeholder="Ex: Notebook Dell Latitude 5420"
                            />
                        </div>

                        <div className="form-group">
                            <label>Marca</label>
                            <input
                                type="text"
                                value={formData.brand}
                                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                placeholder="Ex: Dell"
                            />
                        </div>

                        <div className="form-group">
                            <label>Modelo</label>
                            <input
                                type="text"
                                value={formData.model}
                                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                placeholder="Ex: Latitude 5420"
                            />
                        </div>

                        <div className="form-group">
                            <label>Número de Série</label>
                            <input
                                type="text"
                                value={formData.serialNumber}
                                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                                placeholder="Service Tag / Serial"
                            />
                        </div>

                        <div className="form-group">
                            <label>Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="ativo">Ativo</option>
                                <option value="em_manutencao">Em Manutenção</option>
                                <option value="disponivel">Disponível (Estoque)</option>
                                <option value="descartado">Descartado</option>
                                <option value="perdido">Perdido/Roubado</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Localização</label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                placeholder="Ex: Escritório SP - Mesa 12"
                            />
                        </div>

                        <div className="form-group">
                            <label>Responsável (ID Usuário)</label>
                            <input
                                type="text"
                                value={formData.assignedTo}
                                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                                placeholder="ID do usuário responsável"
                            />
                        </div>

                        <div className="form-group">
                            <label>Data de Compra</label>
                            <input
                                type="date"
                                value={formData.purchaseDate}
                                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label>Garantia Até</label>
                            <input
                                type="date"
                                value={formData.warrantyExpiration}
                                onChange={(e) => setFormData({ ...formData, warrantyExpiration: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Salvando...' : asset ? 'Atualizar' : 'Criar Ativo'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
