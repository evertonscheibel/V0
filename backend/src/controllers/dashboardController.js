import Ticket from '../models/Ticket.js';
import Asset from '../models/Asset.js';
import Certificate from '../models/Certificate.js';
import Boleto from '../models/Boleto.js';
import KnowledgeBase from '../models/KnowledgeBase.js';

// @desc    Obter KPIs do dashboard
// @route   GET /api/dashboard/kpis
// @access  Private
export const getDashboardKPIs = async (req, res, next) => {
    try {
        // Tickets
        const ticketStats = await Ticket.aggregate([
            {
                $facet: {
                    total: [{ $count: 'count' }],
                    byStatus: [
                        { $group: { _id: '$status', count: { $sum: 1 } } }
                    ],
                    byPriority: [
                        { $group: { _id: '$priority', count: { $sum: 1 } } }
                    ],
                    avgResolutionTime: [
                        { $match: { resolvedAt: { $exists: true } } },
                        {
                            $project: {
                                resolutionTime: {
                                    $divide: [
                                        { $subtract: ['$resolvedAt', '$createdAt'] },
                                        1000 * 60 * 60 // converter para horas
                                    ]
                                }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                avgHours: { $avg: '$resolutionTime' }
                            }
                        }
                    ]
                }
            }
        ]);

        // Ativos
        const assetStats = await Asset.aggregate([
            {
                $facet: {
                    total: [{ $count: 'count' }],
                    byStatus: [
                        { $group: { _id: '$status', count: { $sum: 1 } } }
                    ]
                }
            }
        ]);

        // Certificados críticos (expirando em 30 dias)
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 30);

        const criticalCertificates = await Certificate.countDocuments({
            expirationDate: { $lte: futureDate, $gte: new Date() },
            status: 'ativo'
        });

        // Boletos pendentes
        const pendingBoletos = await Boleto.countDocuments({
            status: 'pendente'
        });

        const overdueBoletos = await Boleto.countDocuments({
            status: 'atrasado'
        });

        // Base de conhecimento
        const kbStats = await KnowledgeBase.aggregate([
            {
                $facet: {
                    total: [{ $count: 'count' }],
                    totalViews: [
                        { $group: { _id: null, total: { $sum: '$views' } } }
                    ],
                    topArticles: [
                        { $sort: { views: -1 } },
                        { $limit: 5 },
                        { $project: { title: 1, views: 1, category: 1 } }
                    ]
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                tickets: {
                    total: ticketStats[0].total[0]?.count || 0,
                    byStatus: ticketStats[0].byStatus,
                    byPriority: ticketStats[0].byPriority,
                    avgResolutionTimeHours: ticketStats[0].avgResolutionTime[0]?.avgHours || 0
                },
                assets: {
                    total: assetStats[0].total[0]?.count || 0,
                    byStatus: assetStats[0].byStatus
                },
                certificates: {
                    critical: criticalCertificates
                },
                boletos: {
                    pending: pendingBoletos,
                    overdue: overdueBoletos
                },
                knowledgeBase: {
                    total: kbStats[0].total[0]?.count || 0,
                    totalViews: kbStats[0].totalViews[0]?.total || 0,
                    topArticles: kbStats[0].topArticles
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Obter atividades recentes
// @route   GET /api/dashboard/recent-activity
// @access  Private
export const getRecentActivity = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        const recentTickets = await Ticket.find()
            .populate('requester', 'name')
            .populate('assignedTo', 'name')
            .sort({ createdAt: -1 })
            .limit(limit)
            .select('title status priority createdAt');

        res.json({
            success: true,
            data: {
                tickets: recentTickets
            }
        });
    } catch (error) {
        next(error);
    }
};
