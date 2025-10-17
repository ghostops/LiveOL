const globalSeparator = '~';
const noOrganizationId = 'noorg';
const maxIdLength = 255;

const asciiFold = (s: string) =>
  s.normalize('NFD').replace(/\p{Diacritic}/gu, '') ?? '';

const norm = (s: string, { foldAscii = true } = {}) => {
  let t: string = s
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[.,']/g, '');
  if (t.length > maxIdLength) {
    // Add the # character to indicate that the id was truncated
    t = t.substring(0, maxIdLength - 1) + '#';
  }
  return foldAscii ? asciiFold(t) : t;
};

export class RunnerId {
  private static noOrganizationId = 'noorg';

  public generateId(opts: {
    className: string;
    fullName: string;
    organizationName?: string;
  }): string {
    const orgName = opts.organizationName
      ? OrganizationId.tokenize(opts.organizationName)
      : RunnerId.noOrganizationId;

    return norm(
      `${opts.fullName}${globalSeparator}${opts.className}${globalSeparator}${orgName}`,
    );
  }
}

export class OrganizationId {
  public static tokenize = (org: string) => {
    let t = norm(org);

    t = t
      .replace(/\borienteringsklubb\b/g, ' ok')
      .replace(/\bidrottsklubb\b/g, ' ik')
      .replace(/\bidrottsforening\b/g, ' if')
      .replace(/\bsportklubb\b/g, ' sk');

    t = Array.from(new Set(t.split(' ').filter(Boolean)))
      .sort()
      .join(' ');

    return t;
  };

  public generateId(opts: { organizationName?: string }): string {
    if (!opts.organizationName) {
      return noOrganizationId;
    }
    return OrganizationId.tokenize(opts.organizationName);
  }
}

export class CompetitionId {
  public generateId(opts: {
    competitionName: string;
    organizationName: string;
  }): string {
    const orgName = opts.organizationName
      ? OrganizationId.tokenize(opts.organizationName)
      : noOrganizationId;

    return norm(`${opts.competitionName}${globalSeparator}${orgName}`);
  }
}
