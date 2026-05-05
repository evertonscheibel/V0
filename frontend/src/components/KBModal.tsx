import React, { useState, useEffect } from 'react';
import { kbService } from '../services';
import { X } from 'lucide-react';
import './TicketModal.css';

interface KBModalProps {
    article: any | null;
    onClose: () => void;
    onSave: () => void;
}

export const KBModal: React.FC<KBModalProps> = ({ article, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: 'geral',
        tags: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (article) {
            setFormData({
                title: article.title || '',
                content: article.content || '',
                category: article.category || 'geral',
                tags: article.tags ? article.tags.join(', ') : ''
            });
        }
    }, [article]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const dataToSend = {
                ...formData,
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
            };

            if (article) {
                await kbService.update(article._id, dataToSend);
            } else {
                await kbService.create(dataToSend);
            }

            onSave();
            onClose();
        } catch (error) {
            console.error('Erro ao salvar artigo:', error);
            alert('Erro ao salvar artigo');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{article ? 'Editar Artigo' : 'Novo Artigo'}</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body">
                    <div className="form-grid">
                        <div className="form-group full-width">
                            <label>Título *</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                                placeholder="Ex: Como configurar a impressora"
                            />
                        </div>

                        <div className="form-group">
                            <label>Categoria</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="geral">Geral</option>
                                <option value="hardware">Hardware</option>
                                <option value="software">Software</option>
                                <option value="rede">Rede</option>
                                <option value="procedimentos">Procedimentos</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Tags (separadas por vírgula)</label>
                            <input
                                type="text"
                                value={formData.tags}
                                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                placeholder="Ex: impressora, configuração, rede"
                            />
                        </div>

                        <div className="form-group full-width">
                            <label>Conteúdo *</label>
                            <textarea
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                required
                                rows={10}
                                placeholder="Escreva o conteúdo do artigo aqui..."
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Salvando...' : article ? 'Atualizar' : 'Criar Artigo'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
