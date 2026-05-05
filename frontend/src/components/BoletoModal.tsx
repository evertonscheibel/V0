import React, { useState, useEffect } from 'react';
import { boletoService } from '../services';
import { X } from 'lucide-react';
import './TicketModal.css';

interface BoletoModalProps {
    boleto: any | null;
    onClose: () => void;
    onSave: () => void;
}

export const BoletoModal: React.FC<BoletoModalProps> = ({ boleto, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        description: '',
        provider: '',
        value: '',
        dueDate: '',
        deliverByDate: '',
        status: 'pendente',
        observation: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (boleto) {
            setFormData({
                description: boleto.description || '',
                provider: boleto.provider || '',
                value: boleto.value ? boleto.value.toString() : '',
                dueDate: boleto.dueDate ? boleto.dueDate.split('T')[0] : '',
                deliverByDate: boleto.deliverByDate ? boleto.deliverByDate.split('T')[0] : '',
                status: boleto.status || 'pendente',
                observation: boleto.observation || ''
            });
        }
    }, [boleto]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const dataToSend = {
                ...formData,
                value: parseFloat(formData.value)
            };

            if (boleto) {
                await boletoService.update(boleto._id, dataToSend);
            } else {
                await boletoService.create(dataToSend);
            }

            onSave();
            onClose();
        } catch (error) {
            console.error('Erro ao salvar boleto:', error);
            alert('Erro ao salvar boleto');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{boleto ? 'Editar Boleto' : 'Novo Boleto'}</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body">
                    <div className="form-grid">
                        <div className="form-group full-width">
                            <label>Descrição *</label>
                            <input
                                type="text"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                                placeholder="Ex: Mensalidade Internet"
                            />
                        </div>

                        <div className="form-group">
                            <label>Fornecedor *</label>
                            <input
                                type="text"
                                value={formData.provider}
                                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                                required
                                placeholder="Ex: Vivo"
                            />
                        </div>

                        <div className="form-group">
                            <label>Valor (R$) *</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.value}
                                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                required
                                placeholder="0.00"
                            />
                        </div>

                        <div className="form-group">
                            <label>Data de Vencimento *</label>
                            <input
                                type="date"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Entregar Até (Financeiro)</label>
                            <input
                                type="date"
                                value={formData.deliverByDate}
                                onChange={(e) => setFormData({ ...formData, deliverByDate: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label>Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="pendente">Pendente</option>
                                <option value="entregue">Entregue</option>
                                <option value="pago">Pago</option>
                                <option value="atrasado">Atrasado</option>
                            </select>
                        </div>

                        <div className="form-group full-width">
                            <label>Observação</label>
                            <textarea
                                value={formData.observation}
                                onChange={(e) => setFormData({ ...formData, observation: e.target.value })}
                                rows={3}
                                placeholder="Observações adicionais..."
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Salvando...' : boleto ? 'Atualizar' : 'Criar Boleto'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
