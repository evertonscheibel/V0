import Report from '../models/Report.js';
import Asset from '../models/Asset.js';
import Ticket from '../models/Ticket.js';
import Certificate from '../models/Certificate.js';
import User from '../models/User.js';
import KB from '../models/KB.js';
import Boleto from '../models/Boleto.js';
import XLSX from 'xlsx';

// @desc    Listar todos os relatórios
// @route   GET /api/reports
// @access  Private
export const getReports = async (req, res, next) => {
    try {
        const reports = await Report.find()
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: reports.length,
            data: reports
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Obter relatório por ID
// @route   GET /api/reports/:id
// @access  Private
export const getReport = async (req, res, next) => {
    try {
        const report = await Report.findById(req.params.id)
            .populate('createdBy', 'name email');

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Relatório não encontrado'
            });
        }

        res.json({
            success: true,
            data: report
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Gerar novo relatório
// @route   POST /api/reports/generate
// @access  Private (Admin/Tecnico)
export const generateReport = async (req, res, next) => {
    try {
        const { type, title, description, filters, format } = req.body;

        // Criar registro do relatório
        const report = await Report.create({
            title: title || `Relatório de ${type}`,
            type,
            description,
            filters: filters || {},
            createdBy: req.user._id,
            format: format || 'excel',
            status: 'processing'
        });

        // Buscar dados baseado no tipo
        let data = [];
        let formattedData = [];

        switch (type) {
            case 'tickets':
                data = await Ticket.find(filters || {})
                    .populate('createdBy', 'name email')
                    .populate('assignedTo', 'name email')
                    .sort({ createdAt: -1 });

                formattedData = data.map(ticket => ({
                    'ID': ticket.ticketId,
                    'Título': ticket.title,
                    'Descrição': ticket.description,
                    'Status': ticket.status,
                    'Prioridade': ticket.priority,
                    'Categoria': ticket.category,
                    'Criado Por': ticket.createdBy?.name || 'N/A',
                    'Atribuído Para': ticket.assignedTo?.name || 'Não atribuído',
                    'Data de Criação': new Date(ticket.createdAt).toLocaleDateString('pt-BR'),
                    'Última Atualização': new Date(ticket.updatedAt).toLocaleDateString('pt-BR')
                }));
                break;

            case 'assets':
                data = await Asset.find(filters || {})
                    .populate('assignedTo', 'name email')
                    .sort({ createdAt: -1 });

                formattedData = data.map(asset => ({
                    'ID do Ativo': asset.assetId,
                    'Descrição': asset.description,
                    'Tipo': asset.type,
                    'Marca': asset.brand || '',
                    'Modelo': asset.model || '',
                    'Número de Série': asset.serialNumber || '',
                    'Data de Compra': asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString('pt-BR') : '',
                    'Garantia Até': asset.warrantyExpiration ? new Date(asset.warrantyExpiration).toLocaleDateString('pt-BR') : '',
                    'Status': asset.status,
                    'Localização': asset.location || '',
                    'Responsável': asset.assignedTo?.name || 'Não atribuído'
                }));
                break;

            case 'certificates':
                data = await Certificate.find(filters || {})
                    .sort({ expirationDate: 1 });

                formattedData = data.map(cert => ({
                    'Domínio': cert.domain,
                    'Tipo': cert.type,
                    'Emissor': cert.issuer || '',
                    'Data de Emissão': new Date(cert.issueDate).toLocaleDateString('pt-BR'),
                    'Data de Expiração': new Date(cert.expirationDate).toLocaleDateString('pt-BR'),
                    'Dias para Expirar': Math.ceil((new Date(cert.expirationDate) - new Date()) / (1000 * 60 * 60 * 24)),
                    'Status': cert.status,
                    'Renovação Automática': cert.autoRenew ? 'Sim' : 'Não'
                }));
                break;

            case 'users':
                data = await User.find(filters || {})
                    .select('-password')
                    .sort({ createdAt: -1 });

                formattedData = data.map(user => ({
                    'Nome': user.name,
                    'Email': user.email,
                    'Função': user.role,
                    'Departamento': user.department || '',
                    'Telefone': user.phone || '',
                    'Status': user.isActive ? 'Ativo' : 'Inativo',
                    'Data de Cadastro': new Date(user.createdAt).toLocaleDateString('pt-BR')
                }));
                break;

            case 'kb':
                data = await KB.find(filters || {})
                    .populate('createdBy', 'name')
                    .sort({ createdAt: -1 });

                formattedData = data.map(kb => ({
                    'Título': kb.title,
                    'Categoria': kb.category,
                    'Tags': kb.tags?.join(', ') || '',
                    'Visualizações': kb.views || 0,
                    'Útil': kb.helpful || 0,
                    'Criado Por': kb.createdBy?.name || 'N/A',
                    'Data de Criação': new Date(kb.createdAt).toLocaleDateString('pt-BR'),
                    'Última Atualização': new Date(kb.updatedAt).toLocaleDateString('pt-BR')
                }));
                break;

            case 'boletos':
                data = await Boleto.find(filters || {})
                    .populate('client', 'name')
                    .sort({ dueDate: -1 });

                formattedData = data.map(boleto => ({
                    'Cliente': boleto.client?.name || 'N/A',
                    'Valor': `R$ ${boleto.amount.toFixed(2)}`,
                    'Data de Vencimento': new Date(boleto.dueDate).toLocaleDateString('pt-BR'),
                    'Status': boleto.status,
                    'Data de Pagamento': boleto.paymentDate ? new Date(boleto.paymentDate).toLocaleDateString('pt-BR') : 'Não pago',
                    'Descrição': boleto.description || ''
                }));
                break;

            default:
                return res.status(400).json({
                    success: false,
                    message: 'Tipo de relatório inválido'
                });
        }

        // Gerar arquivo Excel
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(formattedData);
        XLSX.utils.book_append_sheet(wb, ws, type.charAt(0).toUpperCase() + type.slice(1));

        // Gerar buffer
        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

        // Atualizar relatório
        report.status = 'completed';
        report.recordCount = data.length;
        await report.save();

        // Enviar arquivo
        res.setHeader('Content-Disposition', `attachment; filename=relatorio_${type}_${Date.now()}.xlsx`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    } catch (error) {
        next(error);
    }
};

// @desc    Deletar relatório
// @route   DELETE /api/reports/:id
// @access  Private (Admin)
export const deleteReport = async (req, res, next) => {
    try {
        const report = await Report.findById(req.params.id);

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Relatório não encontrado'
            });
        }

        await report.deleteOne();

        res.json({
            success: true,
            message: 'Relatório deletado com sucesso'
        });
    } catch (error) {
        next(error);
    }
};
