import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { ticketService, Ticket } from '../services/ticketService';
import { useAuth } from '../context/AuthContext';
import { X, Upload, File, Trash2, Send } from 'lucide-react';
import './TicketModal.css';

interface TicketModalProps {
    ticket: Ticket | null;
    onClose: () => void;
}

export const TicketModal: React.FC<TicketModalProps> = ({ ticket, onClose }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        title: ticket?.title || '',
        description: ticket?.description || '',
        category: ticket?.category || 'outros',
        priority: ticket?.priority || 'media',
        status: ticket?.status || 'aberto',
        assignedTo: ticket?.assignedTo?._id || ''
    });
    const [files, setFiles] = useState<File[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setFiles(prev => [...prev, ...acceptedFiles]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxSize: 5242880, // 5MB
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc', '.docx'],
            'text/*': ['.txt']
        }
    });

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Limpar campos vazios para não dar erro de Cast no Mongoose
            const dataToSend: any = { ...formData };

            if (!dataToSend.assignedTo) {
                delete dataToSend.assignedTo;
            }

            if (ticket) {
                // Atualizar ticket existente
                await ticketService.update(ticket._id, dataToSend);
            } else {
                // Criar novo ticket
                await ticketService.create(dataToSend);
            }

            // TODO: Upload de arquivos (implementar endpoint no backend)

            onClose();
            // Recarregar a página para atualizar a lista
            window.location.reload();
        } catch (error: any) {
            console.error('Erro ao salvar ticket:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Erro desconhecido ao salvar ticket';
            alert(`Erro ao salvar ticket: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim() || !ticket) return;

        try {
            await ticketService.addComment(ticket._id, newComment);
            setNewComment('');
            // Recarregar ticket
            window.location.reload();
        } catch (error) {
            console.error('Erro ao adicionar comentário:', error);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{ticket ? 'Detalhes do Ticket' : 'Novo Ticket'}</h2>
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
                                placeholder="Digite o título do ticket"
                            />
                        </div>

                        <div className="form-group full-width">
                            <label>Descrição *</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                                rows={4}
                                placeholder="Descreva o problema em detalhes"
                            />
                        </div>

                        <div className="form-group">
                            <label>Categoria</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="hardware">Hardware</option>
                                <option value="software">Software</option>
                                <option value="rede">Rede</option>
                                <option value="acesso">Acesso</option>
                                <option value="outros">Outros</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Prioridade</label>
                            <select
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                            >
                                <option value="baixa">Baixa</option>
                                <option value="media">Média</option>
                                <option value="alta">Alta</option>
                                <option value="critica">Crítica</option>
                            </select>
                        </div>

                        {(user?.role === 'admin' || user?.role === 'tecnico') && (
                            <>
                                <div className="form-group">
                                    <label>Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="aberto">Aberto</option>
                                        <option value="em_andamento">Em Andamento</option>
                                        <option value="resolvido">Resolvido</option>
                                        <option value="fechado">Fechado</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Atribuir a (ID do Técnico)</label>
                                    <input
                                        type="text"
                                        value={formData.assignedTo}
                                        onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                                        placeholder="Cole o ID do usuário aqui"
                                    />
                                    <small style={{ color: '#64748b', display: 'block', marginTop: '4px' }}>
                                        * Digite o ID do usuário (ex: 656...) não o nome.
                                    </small>
                                </div>
                            </>
                        )}

                        {/* Upload de Arquivos */}
                        <div className="form-group full-width">
                            <label>Anexos</label>
                            <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
                                <input {...getInputProps()} />
                                <Upload size={32} />
                                <p>
                                    {isDragActive
                                        ? 'Solte os arquivos aqui...'
                                        : 'Arraste arquivos ou clique para selecionar'}
                                </p>
                                <span className="dropzone-hint">
                                    Máximo 5MB por arquivo (PDF, DOC, imagens)
                                </span>
                            </div>

                            {files.length > 0 && (
                                <div className="files-list">
                                    {files.map((file, index) => (
                                        <div key={index} className="file-item">
                                            <File size={20} />
                                            <span className="file-name">{file.name}</span>
                                            <span className="file-size">
                                                {(file.size / 1024).toFixed(1)} KB
                                            </span>
                                            <button
                                                type="button"
                                                className="remove-file-btn"
                                                onClick={() => removeFile(index)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Comentários (apenas se for ticket existente) */}
                    {ticket && (
                        <div className="comments-section">
                            <h3>Comentários ({ticket.comments.length})</h3>

                            <div className="comments-list">
                                {ticket.comments.map((comment: any, index: number) => (
                                    <div key={index} className="comment-item">
                                        <div className="comment-header">
                                            <strong>{comment.user?.name || 'Usuário'}</strong>
                                            <span>{new Date(comment.createdAt).toLocaleString('pt-BR')}</span>
                                        </div>
                                        <p>{comment.comment}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="add-comment">
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Adicionar comentário..."
                                    rows={3}
                                />
                                <button
                                    type="button"
                                    className="btn-send-comment"
                                    onClick={handleAddComment}
                                    disabled={!newComment.trim()}
                                >
                                    <Send size={18} />
                                    Enviar
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Salvando...' : ticket ? 'Atualizar' : 'Criar Ticket'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
