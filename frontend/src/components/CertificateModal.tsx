import React, { useState, useEffect } from 'react';
import { certificateService } from '../services';
import { X } from 'lucide-react';
import './TicketModal.css';

interface CertificateModalProps {
    certificate: any | null;
    onClose: () => void;
    onSave: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ certificate, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        type: 'ssl',
        provider: '',
        issueDate: '',
        expirationDate: '',
        status: 'ativo',
        notifyBeforeDays: 30,
        autoRenew: false
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (certificate) {
            setFormData({
                name: certificate.name || '',
                type: certificate.type || 'ssl',
                provider: certificate.provider || '',
                issueDate: certificate.issueDate ? certificate.issueDate.split('T')[0] : '',
                expirationDate: certificate.expirationDate ? certificate.expirationDate.split('T')[0] : '',
                status: certificate.status || 'ativo',
                notifyBeforeDays: certificate.notifyBeforeDays || 30,
                autoRenew: certificate.autoRenew || false
            });
        }
    }, [certificate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (certificate) {
                await certificateService.update(certificate._id, formData);
            } else {
                await certificateService.create(formData);
            }

            onSave();
            onClose();
        } catch (error) {
            console.error('Erro ao salvar certificado:', error);
            alert('Erro ao salvar certificado');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{certificate ? 'Editar Certificado' : 'Novo Certificado'}</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body">
                    <div className="form-grid">
                        <div className="form-group full-width">
                            <label>Nome do Certificado *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                placeholder="Ex: SSL Wildcard *.empresa.com"
                            />
                        </div>

                        <div className="form-group">
                            <label>Tipo *</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                required
                            >
                                <option value="ssl">SSL / TLS</option>
                                <option value="software">Licença de Software</option>
                                <option value="dominio">Domínio</option>
                                <option value="contrato">Contrato de Suporte</option>
                                <option value="outro">Outro</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Fornecedor</label>
                            <input
                                type="text"
                                value={formData.provider}
                                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                                placeholder="Ex: GoDaddy, Microsoft"
                            />
                        </div>

                        <div className="form-group">
                            <label>Data de Emissão *</label>
                            <input
                                type="date"
                                value={formData.issueDate}
                                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Data de Expiração *</label>
                            <input
                                type="date"
                                value={formData.expirationDate}
                                onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="ativo">Ativo</option>
                                <option value="expirado">Expirado</option>
                                <option value="revogado">Revogado</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Notificar antes de (dias)</label>
                            <input
                                type="number"
                                value={formData.notifyBeforeDays}
                                onChange={(e) => setFormData({ ...formData, notifyBeforeDays: parseInt(e.target.value) })}
                                min="1"
                            />
                        </div>

                        <div className="form-group full-width">
                            <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.autoRenew}
                                    onChange={(e) => setFormData({ ...formData, autoRenew: e.target.checked })}
                                    style={{ width: 'auto' }}
                                />
                                Renovação Automática
                            </label>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Salvando...' : certificate ? 'Atualizar' : 'Criar Certificado'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
