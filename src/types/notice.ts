import { z } from "zod";
import type { SpeciesWithSubrace } from "./species";
import { SpeciesWithSubraceSchema } from "./species";

// Enum para tipos de avisos baseado na tabela 1d20 do arquivo .md
export enum NoticeType {
  NOTHING = "nothing", // 1: Nada
  RESIDENTS_NOTICE = "residents_notice", // 2-6: Aviso dos habitantes
  SERVICES = "services", // 7-8: 1d4 serviços
  COMMERCIAL_PROPOSAL = "commercial_proposal", // 9-10: Proposta comercial
  ANNOUNCEMENT = "announcement", // 11-13: Divulgação
  HUNT_PROPOSAL = "hunt_proposal", // 14: Proposta de caçada
  WANTED_POSTER = "wanted_poster", // 15-16: Cartaz de procurado
  CONTRACTS = "contracts", // 17-18: 1d4 contratos
  EXECUTION = "execution", // 19: Execução
  OFFICIAL_STATEMENT = "official_statement", // 20: Pronunciamento
}

// Enum para status do aviso
export enum NoticeStatus {
  ACTIVE = "active", // Ativo no mural
  RESOLVED = "resolved", // Resolvido/retirado
  EXPIRED = "expired", // Expirado por tempo
}

// Enum para pagamento alternativo (1d20)
export enum AlternativePayment {
  NONE = "none", // 1-6: Não há pagamento
  IRON_COPPER = "iron_copper", // 7: Ferro ou peças de cobre
  COPPER_SILVER = "copper_silver", // 8: Cobre ou prata
  ANIMALS = "animals", // 9-11: Equivalente em animais
  LAND = "land", // 12: Equivalente em terras
  HARVEST = "harvest", // 13-14: Equivalente em colheita
  FAVORS = "favors", // 15-16: Favores
  TREASURE_MAP = "treasure_map", // 17: Mapa ou localização de tesouro
  SPICES = "spices", // 18-19: Equivalente em especiarias
  VALUABLE_OBJECTS = "valuable_objects", // 20: Objetos valiosos
}

// Tipo para proposta comercial
export interface CommercialProposal {
  type:
    | "buy"
    | "sell"
    | "auction"
    | "trade_services"
    | "trade_favors"
    | "trade_information"
    | "trade_food"
    | "trade_comfort"
    | "trade_art_gems"
    | "trade_magic_item";
  what:
    | "animal_parts"
    | "services"
    | "rural_animals"
    | "magic_potions"
    | "art_objects"
    | "spices"
    | "weapons"
    | "protection"
    | "blessings_prayers"
    | "contraption"
    | "magic_item";
  who: SpeciesWithSubrace;
  whoType:
    | "mediocre_commoner"
    | "specialist"
    | "experienced_commoner"
    | "aristocrat"
    | "arcane_adept"
    | "divine_adept"
    | "academic_adept"
    | "adventurer"
    | "unprepared_child"
    | "combatant";
}

// Tipo para divulgação
export interface Announcement {
  type:
    | "shop_products"
    | "new_discovery"
    | "exhibition_auction"
    | "verbal_announcement"
    | "recruitment"
    | "religious_celebration"
    | "entertainment"
    | "teaching"
    | "sport_competition"
    | "festivities";
  from: SpeciesWithSubrace;
  fromType:
    | "nobility"
    | "commoners_local"
    | "specialists"
    | "guild"
    | "clergy"
    | "nomads"
    | "organization"
    | "adepts"
    | "hostile_humanoids"
    | "adventurers";
}

// Tipo para execução
export interface Execution {
  who: {
    type:
      | "bandits"
      | "witch"
      | "commoners"
      | "wanted_captured"
      | "public_enemies"
      | "cultists"
      | "adepts"
      | "hostile_humanoids"
      | "innocent"
      | "adventurers";
    quantity: number; // Para casos como "1d4 bandidos", "2d6 plebeus"
    species: SpeciesWithSubrace[];
  };
  reason:
    | "heinous_reasons"
    | "tax_debt"
    | "murders"
    | "minor_thefts"
    | "major_robberies"
    | "treason_espionage"
    | "fraud"
    | "futile_reason"
    | "contain_calamity"
    | "magic_misuse";
  method:
    | "gallows_guillotine"
    | "fire_stoning"
    | "dungeon"
    | "combat_arena"
    | "poison"
    | "exile_inhospitable"
    | "buried_neck_deep"
    | "religious_ritual"
    | "creature_den"
    | "magic";
}

// Tipo para cartaz de procurado
export interface WantedPoster {
  type: "missing_innocent" | "fugitive_convict";
  target: SpeciesWithSubrace;
  details: MissingInnocentDetails | FugitiveConvictDetails;
}

// Detalhes de inocente desaparecido
export interface MissingInnocentDetails {
  who:
    | "noble"
    | "child"
    | "commoner"
    | "domestic_animal"
    | "merchant"
    | "retired_adventurer"
    | "specialist"
    | "adept"
    | "charismatic_creature"
    | "adventurer";
  lastSeen:
    | "home"
    | "tavern_inn"
    | "temple"
    | "leaving_settlement"
    | "public_place"
    | "other_home"
    | "routine_activities"
    | "noble_residence"
    | "government_building"
    | "work";
  characteristics1:
    | "loved_by_all"
    | "hated_by_many"
    | "suspicious_activities"
    | "nobody_knows"
    | "gentle_shy"
    | "reclusive_grumpy"
    | "naive_too_much"
    | "coward_treacherous"
    | "best_at_activity"
    | "sick_weak";
  characteristics2:
    | "gossiper"
    | "prodigy"
    | "atheist"
    | "rebel"
    | "singular_scar"
    | "unlucky"
    | "wild_friendship"
    | "clumsy"
    | "orphan"
    | "deformity";
  peculiarity:
    | "cursed"
    | "sunlight_sensitivity"
    | "ritual_symbols"
    | "old_hero_familiar"
    | "secret_life"
    | "none"
    | "magic_involved"
    | "not_from_plane"
    | "strangely_familiar"
    | "declared_dead";
  reward?: string; // Pode ser "Nenhuma" ou valores como "1d20 C$", "3d6+5 PO$"
}

// Detalhes de condenado fugitivo
export interface FugitiveConvictDetails {
  infamyReason:
    | "crime_against_nobility"
    | "crime_against_officials"
    | "crime_against_settlement"
    | "crime_against_gods"
    | "crime_against_citizens"
    | "crime_against_organizations"
    | "heinous_crimes"
    | "conspiracy_victim"
    | "environmental_crime"
    | "multiple_crimes";
  dangerLevel:
    | "almost_harmless"
    | "very_low"
    | "very_low_2"
    | "low"
    | "medium"
    | "high"
    | "very_high"
    | "extremely_high"
    | "critical"
    | "mortal_danger";
  peculiarities:
    | "harmless_appearance"
    | "subterfuge_master"
    | "seductive_persuasive"
    | "athletic_acrobat"
    | "brute"
    | "damage_immunity"
    | "criminal_fame"
    | "crazy_psychopath"
    | "lycanthropy"
    | "notable_traits";
  characteristics:
    | "horrible_scar"
    | "mechanical_magical_prosthetics"
    | "exotic_tattoos"
    | "prophetic_birthmark"
    | "height_abnormal"
    | "wealthy"
    | "attribute_5"
    | "supernatural_gift"
    | "polyglot"
    | "cursed";
  notableTraits?:
    | "excellent_swordsman"
    | "arcane_caster"
    | "divine_caster"
    | "beast_master"
    | "crazy_alchemist"
    | "skilled_trader"
    | "organization_leader"
    | "eccentric_ritualist"
    | "uncontrollable_fury"
    | "master_marksman";
  reward: string; // Baseado no nível de periculosidade
}

// Tipo para proposta de caçada
export interface HuntProposal {
  huntType:
    | "gang_of"
    | "single_powerful"
    | "caster_and_his"
    | "couple_of"
    | "leader_and_lackeys"
    | "lair_of"
    | "sect_worships"
    | "avenge_victims"
    | "track_capture"
    | "kidnappers_humanoids"
    | "mortal_enemy";
  creatureSpecification:
    | "cursed"
    | "constructs"
    | "demons"
    | "dragonoids"
    | "fauna"
    | "giants"
    | "humanoids"
    | "monstrosities"
    | "undead"
    | "celestials";
  location:
    | "forest"
    | "settlement"
    | "desert"
    | "abandoned_building"
    | "mountains_hills"
    | "cave"
    | "swamp"
    | "plain"
    | "underground"
    | "coast"
    | "underwater"
    | "open_sea";
  huntPeculiarity?: string; // Pode ter múltiplas peculiaridades
  characteristics1?: string; // Características I da caça
  characteristics2?: string; // Características II da caça
  testAdvantage?: string; // Vantagem em testes
  twist?: HuntTwist;
  rewardCalculationInfo: {
    creatureNA: string; // Para referência do mestre
    creatureQuantity: number;
    rewardNote: string; // Nota sobre usar a tabela de recompensas
  };
}

// Tipo para reviravolta na caçada
export interface HuntTwist {
  hasTwist: boolean;
  type?:
    | "old_acquaintance"
    | "wrong_target"
    | "contractor_hunted"
    | "target_hunts_back"
    | "fake_target"
    | "curse"
    | "already_dead"
    | "contractor_guilty"
    | "reward_unexpected"
    | "other_hunters"
    | "protectors"
    | "harmless_target"
    | "trap"
    | "missing_info"
    | "suspiciously_easy"
    | "multiple_twists";
}

// Tipo para aviso dos habitantes
export interface ResidentsNotice {
  type:
    | "nearby_dangers_rumor"
    | "government_gossip"
    | "product_service_gossip"
    | "relic_rumor"
    | "disputes_gossip"
    | "treasure_rumor"
    | "district_gossip"
    | "unusual_complaints"
    | "organization_gossip"
    | "relevant_local_news";
  content: string; // Conteúdo gerado do aviso
  involvedSpecies?: SpeciesWithSubrace[]; // Espécies mencionadas no aviso
}

// Tipo para pronunciamento oficial
export interface OfficialStatement {
  type:
    | "imminent_calamity"
    | "new_law_change"
    | "popular_jury_trial"
    | "power_structure_change"
    | "population_benefits"
    | "temporary_prohibitions"
    | "obituary"
    | "taxation"
    | "new_important_organization"
    | "decoration";
  peculiarity:
    | "coded_message"
    | "renowned_family_seal"
    | "uncommon_dialect"
    | "forged_for_corruption"
    | "none"
    | "abruptly_cancelled"
    | "retaliation_due"
    | "biased_statement"
    | "local_leader_requested"
    | "unreliable_source";
  content: string;
  involvedSpecies?: SpeciesWithSubrace[]; // Espécies mencionadas
}

// Interface principal do aviso
export interface Notice {
  id: string;
  guildId: string; // ID da guilda onde o aviso está fixado
  type: NoticeType;
  status: NoticeStatus;
  createdDate: Date; // Data quando o aviso foi criado na timeline
  expirationDate?: Date; // Data quando será removido/resolvido

  // Conteúdo específico baseado no tipo (union discriminada)
  content:
    | CommercialProposal
    | Announcement
    | Execution
    | WantedPoster
    | HuntProposal
    | ResidentsNotice
    | OfficialStatement
    | null;

  // Informações sobre pagamento alternativo (para contratos/serviços do mural)
  alternativePayment?: AlternativePayment;
  reducedReward?: boolean; // true se recompensa é 1/3 da original

  // Espécies mencionadas no aviso
  mentionedSpecies: SpeciesWithSubrace[];

  // Metadados
  createdAt: Date;
  updatedAt: Date;
}

// Schemas Zod para validação

export const NoticeTypeSchema = z.nativeEnum(NoticeType);
export const NoticeStatusSchema = z.nativeEnum(NoticeStatus);
export const AlternativePaymentSchema = z.nativeEnum(AlternativePayment);

export const CommercialProposalSchema = z.object({
  type: z.enum([
    "buy",
    "sell",
    "auction",
    "trade_services",
    "trade_favors",
    "trade_information",
    "trade_food",
    "trade_comfort",
    "trade_art_gems",
    "trade_magic_item",
  ]),
  what: z.enum([
    "animal_parts",
    "services",
    "rural_animals",
    "magic_potions",
    "art_objects",
    "spices",
    "weapons",
    "protection",
    "blessings_prayers",
    "contraption",
    "magic_item",
  ]),
  who: SpeciesWithSubraceSchema,
  whoType: z.enum([
    "mediocre_commoner",
    "specialist",
    "experienced_commoner",
    "aristocrat",
    "arcane_adept",
    "divine_adept",
    "academic_adept",
    "adventurer",
    "unprepared_child",
    "combatant",
  ]),
});

export const AnnouncementSchema = z.object({
  type: z.enum([
    "shop_products",
    "new_discovery",
    "exhibition_auction",
    "verbal_announcement",
    "recruitment",
    "religious_celebration",
    "entertainment",
    "teaching",
    "sport_competition",
    "festivities",
  ]),
  from: SpeciesWithSubraceSchema,
  fromType: z.enum([
    "nobility",
    "commoners_local",
    "specialists",
    "guild",
    "clergy",
    "nomads",
    "organization",
    "adepts",
    "hostile_humanoids",
    "adventurers",
  ]),
});

export const ExecutionSchema = z.object({
  who: z.object({
    type: z.enum([
      "bandits",
      "witch",
      "commoners",
      "wanted_captured",
      "public_enemies",
      "cultists",
      "adepts",
      "hostile_humanoids",
      "innocent",
      "adventurers",
    ]),
    quantity: z.number().positive(),
    species: z.array(SpeciesWithSubraceSchema),
  }),
  reason: z.enum([
    "heinous_reasons",
    "tax_debt",
    "murders",
    "minor_thefts",
    "major_robberies",
    "treason_espionage",
    "fraud",
    "futile_reason",
    "contain_calamity",
    "magic_misuse",
  ]),
  method: z.enum([
    "gallows_guillotine",
    "fire_stoning",
    "dungeon",
    "combat_arena",
    "poison",
    "exile_inhospitable",
    "buried_neck_deep",
    "religious_ritual",
    "creature_den",
    "magic",
  ]),
});

export const MissingInnocentDetailsSchema = z.object({
  who: z.enum([
    "noble",
    "child",
    "commoner",
    "domestic_animal",
    "merchant",
    "retired_adventurer",
    "specialist",
    "adept",
    "charismatic_creature",
    "adventurer",
  ]),
  lastSeen: z.enum([
    "home",
    "tavern_inn",
    "temple",
    "leaving_settlement",
    "public_place",
    "other_home",
    "routine_activities",
    "noble_residence",
    "government_building",
    "work",
  ]),
  characteristics1: z.enum([
    "loved_by_all",
    "hated_by_many",
    "suspicious_activities",
    "nobody_knows",
    "gentle_shy",
    "reclusive_grumpy",
    "naive_too_much",
    "coward_treacherous",
    "best_at_activity",
    "sick_weak",
  ]),
  characteristics2: z.enum([
    "gossiper",
    "prodigy",
    "atheist",
    "rebel",
    "singular_scar",
    "unlucky",
    "wild_friendship",
    "clumsy",
    "orphan",
    "deformity",
  ]),
  peculiarity: z.enum([
    "cursed",
    "sunlight_sensitivity",
    "ritual_symbols",
    "old_hero_familiar",
    "secret_life",
    "none",
    "magic_involved",
    "not_from_plane",
    "strangely_familiar",
    "declared_dead",
  ]),
  reward: z.string().optional(),
});

export const FugitiveConvictDetailsSchema = z.object({
  infamyReason: z.enum([
    "crime_against_nobility",
    "crime_against_officials",
    "crime_against_settlement",
    "crime_against_gods",
    "crime_against_citizens",
    "crime_against_organizations",
    "heinous_crimes",
    "conspiracy_victim",
    "environmental_crime",
    "multiple_crimes",
  ]),
  dangerLevel: z.enum([
    "almost_harmless",
    "very_low",
    "very_low_2",
    "low",
    "medium",
    "high",
    "very_high",
    "extremely_high",
    "critical",
    "mortal_danger",
  ]),
  peculiarities: z.enum([
    "harmless_appearance",
    "subterfuge_master",
    "seductive_persuasive",
    "athletic_acrobat",
    "brute",
    "damage_immunity",
    "criminal_fame",
    "crazy_psychopath",
    "lycanthropy",
    "notable_traits",
  ]),
  characteristics: z.enum([
    "horrible_scar",
    "mechanical_magical_prosthetics",
    "exotic_tattoos",
    "prophetic_birthmark",
    "height_abnormal",
    "wealthy",
    "attribute_5",
    "supernatural_gift",
    "polyglot",
    "cursed",
  ]),
  notableTraits: z
    .enum([
      "excellent_swordsman",
      "arcane_caster",
      "divine_caster",
      "beast_master",
      "crazy_alchemist",
      "skilled_trader",
      "organization_leader",
      "eccentric_ritualist",
      "uncontrollable_fury",
      "master_marksman",
    ])
    .optional(),
  reward: z.string(),
});

export const WantedPosterSchema = z.object({
  type: z.enum(["missing_innocent", "fugitive_convict"]),
  target: SpeciesWithSubraceSchema,
  details: z.union([
    MissingInnocentDetailsSchema,
    FugitiveConvictDetailsSchema,
  ]),
});

export const HuntTwistSchema = z.object({
  hasTwist: z.boolean(),
  type: z
    .enum([
      "old_acquaintance",
      "wrong_target",
      "contractor_hunted",
      "target_hunts_back",
      "fake_target",
      "curse",
      "already_dead",
      "contractor_guilty",
      "reward_unexpected",
      "other_hunters",
      "protectors",
      "harmless_target",
      "trap",
      "missing_info",
      "suspiciously_easy",
      "multiple_twists",
    ])
    .optional(),
});

export const HuntProposalSchema = z.object({
  huntType: z.enum([
    "gang_of",
    "single_powerful",
    "caster_and_his",
    "couple_of",
    "leader_and_lackeys",
    "lair_of",
    "sect_worships",
    "avenge_victims",
    "track_capture",
    "kidnappers_humanoids",
    "mortal_enemy",
  ]),
  creatureSpecification: z.enum([
    "cursed",
    "constructs",
    "demons",
    "dragonoids",
    "fauna",
    "giants",
    "humanoids",
    "monstrosities",
    "undead",
    "celestials",
  ]),
  location: z.enum([
    "forest",
    "settlement",
    "desert",
    "abandoned_building",
    "mountains_hills",
    "cave",
    "swamp",
    "plain",
    "underground",
    "coast",
    "underwater",
    "open_sea",
  ]),
  huntPeculiarity: z.string().optional(),
  characteristics1: z.string().optional(),
  characteristics2: z.string().optional(),
  testAdvantage: z.string().optional(),
  twist: HuntTwistSchema.optional(),
  rewardCalculationInfo: z.object({
    creatureNA: z.string(),
    creatureQuantity: z.number().positive(),
    rewardNote: z.string(),
  }),
});

export const ResidentsNoticeSchema = z.object({
  type: z.enum([
    "nearby_dangers_rumor",
    "government_gossip",
    "product_service_gossip",
    "relic_rumor",
    "disputes_gossip",
    "treasure_rumor",
    "district_gossip",
    "unusual_complaints",
    "organization_gossip",
    "relevant_local_news",
  ]),
  content: z.string(),
  involvedSpecies: z.array(SpeciesWithSubraceSchema).optional(),
});

export const OfficialStatementSchema = z.object({
  type: z.enum([
    "imminent_calamity",
    "new_law_change",
    "popular_jury_trial",
    "power_structure_change",
    "population_benefits",
    "temporary_prohibitions",
    "obituary",
    "taxation",
    "new_important_organization",
    "decoration",
  ]),
  peculiarity: z.enum([
    "coded_message",
    "renowned_family_seal",
    "uncommon_dialect",
    "forged_for_corruption",
    "none",
    "abruptly_cancelled",
    "retaliation_due",
    "biased_statement",
    "local_leader_requested",
    "unreliable_source",
  ]),
  content: z.string(),
  involvedSpecies: z.array(SpeciesWithSubraceSchema).optional(),
});

// Schema principal do aviso
export const NoticeSchema = z.object({
  id: z.string(),
  guildId: z.string(),
  type: NoticeTypeSchema,
  status: NoticeStatusSchema,
  createdDate: z.date(),
  expirationDate: z.date().optional(),
  content: z
    .union([
      CommercialProposalSchema,
      AnnouncementSchema,
      ExecutionSchema,
      WantedPosterSchema,
      HuntProposalSchema,
      ResidentsNoticeSchema,
      OfficialStatementSchema,
    ])
    .nullable(),
  alternativePayment: AlternativePaymentSchema.optional(),
  reducedReward: z.boolean().optional(),
  mentionedSpecies: z.array(SpeciesWithSubraceSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Funções de validação
export function validateNotice(data: unknown): Notice {
  return NoticeSchema.parse(data);
}

export function validateNoticeType(data: unknown): NoticeType {
  return NoticeTypeSchema.parse(data);
}

export function validateCommercialProposal(data: unknown): CommercialProposal {
  return CommercialProposalSchema.parse(data);
}

export function validateAnnouncement(data: unknown): Announcement {
  return AnnouncementSchema.parse(data);
}

export function validateExecution(data: unknown): Execution {
  return ExecutionSchema.parse(data);
}

export function validateWantedPoster(data: unknown): WantedPoster {
  return WantedPosterSchema.parse(data);
}

export function validateHuntProposal(data: unknown): HuntProposal {
  return HuntProposalSchema.parse(data);
}

export function validateResidentsNotice(data: unknown): ResidentsNotice {
  return ResidentsNoticeSchema.parse(data);
}

export function validateOfficialStatement(data: unknown): OfficialStatement {
  return OfficialStatementSchema.parse(data);
}
