"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SearchService = class SearchService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async globalSearch(query, userId) {
        const searchTerm = query.toLowerCase().trim();
        const results = [];
        const hosts = await this.prisma.host.findMany({
            where: {
                userId,
                OR: [
                    { ip: { contains: searchTerm } },
                    { uid: { contains: searchTerm } },
                    { notes: { contains: searchTerm } },
                ]
            },
            take: 5
        });
        hosts.forEach(host => {
            results.push({
                id: host.id,
                type: 'host',
                title: `${host.ip}:${host.port}`,
                description: `${host.uid} - ${host.status} - Expires: ${host.expiredAt.toLocaleDateString()}`,
                url: `/hosts/${host.id}/edit`,
                icon: '🖥️',
                relevance: this.calculateRelevance(searchTerm, `${host.ip} ${host.uid} ${host.notes || ''}`)
            });
        });
        const transactions = await this.prisma.transaction.findMany({
            where: {
                OR: [
                    { name: { contains: searchTerm } },
                    { type: { contains: searchTerm } },
                ]
            },
            take: 5
        });
        transactions.forEach(transaction => {
            results.push({
                id: transaction.id,
                type: 'transaction',
                title: transaction.name,
                description: `${transaction.type} - ${transaction.amount} - ${transaction.date.toLocaleDateString()}`,
                url: `/transaction`,
                icon: '💰',
                relevance: this.calculateRelevance(searchTerm, `${transaction.name} ${transaction.type}`)
            });
        });
        const teams = await this.prisma.team.findMany({
            where: {
                OR: [
                    { name: { contains: searchTerm } },
                    { description: { contains: searchTerm } },
                ],
                users: {
                    some: { userId }
                }
            },
            take: 3
        });
        teams.forEach(team => {
            results.push({
                id: team.id,
                type: 'team',
                title: team.name,
                description: team.description || 'Team',
                url: `/team/${team.id}/edit`,
                icon: '👥',
                relevance: this.calculateRelevance(searchTerm, `${team.name} ${team.description || ''}`)
            });
        });
        results.sort((a, b) => b.relevance - a.relevance);
        await this.saveSearchQuery(query, userId);
        return { results: results.slice(0, 10) };
    }
    async getSearchSuggestions(query, userId) {
        if (!query || query.length < 1) {
            return { suggestions: [] };
        }
        const searchTerm = query.toLowerCase();
        const suggestions = new Set();
        const hosts = await this.prisma.host.findMany({
            where: {
                userId,
                OR: [
                    { ip: { startsWith: searchTerm } },
                    { uid: { startsWith: searchTerm } },
                ]
            },
            select: { ip: true, uid: true },
            take: 5
        });
        hosts.forEach(host => {
            if (host.ip.toLowerCase().startsWith(searchTerm)) {
                suggestions.add(host.ip);
            }
            if (host.uid.toLowerCase().startsWith(searchTerm)) {
                suggestions.add(host.uid);
            }
        });
        const commonTerms = [
            'active hosts',
            'expired hosts',
            'expiring hosts',
            'income transactions',
            'expense transactions',
            'team members',
            'subscription'
        ];
        commonTerms.forEach(term => {
            if (term.toLowerCase().includes(searchTerm)) {
                suggestions.add(term);
            }
        });
        return { suggestions: Array.from(suggestions).slice(0, 8) };
    }
    async getRecentSearches(userId) {
        return {
            searches: [
                'active hosts',
                'server-01',
                'expired',
                'team alpha'
            ]
        };
    }
    calculateRelevance(query, text) {
        const queryLower = query.toLowerCase();
        const textLower = text.toLowerCase();
        if (textLower === queryLower)
            return 100;
        if (textLower.startsWith(queryLower))
            return 80;
        if (textLower.includes(queryLower))
            return 60;
        const queryWords = queryLower.split(' ');
        const textWords = textLower.split(' ');
        let wordMatches = 0;
        queryWords.forEach(qWord => {
            if (textWords.some(tWord => tWord.includes(qWord))) {
                wordMatches++;
            }
        });
        return (wordMatches / queryWords.length) * 40;
    }
    async saveSearchQuery(query, userId) {
        console.log(`User ${userId} searched for: ${query}`);
    }
};
exports.SearchService = SearchService;
exports.SearchService = SearchService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SearchService);
//# sourceMappingURL=search.service.js.map