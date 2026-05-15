export type HelpSection = { title: string; body: string };
export type HelpContent = { pageTitle: string; intro: string; sections: HelpSection[] };

export const HELP: Record<string, HelpContent> = {
  dashboard: {
    pageTitle: "Dashboard",
    intro: "Het dashboard geeft een realtime overzicht van alle testactiviteit binnen jouw project.",
    sections: [
      {
        title: "KPI-kaarten",
        body: "Bovenaan zie je vier cijfers: actieve projecten, open bevindingen, kritieke issues en uitstaande taken. Kritieke issues zijn bevindingen met impact 'Kritiek' die nog niet opgelost of afgewezen zijn.",
      },
      {
        title: "Actieve projecten",
        body: "Het linker overzicht toont projecten met de status ACTIVE. Klik op een project om de fases en flows te bekijken.",
      },
      {
        title: "Uitstaande taken per persoon",
        body: "Het rechter overzicht toont hoeveel open testuitvoertaken (STEP_EXECUTION) er per persoon zijn. Taken die langer dan 48 uur niet zijn aangeraakt worden oranje gemarkeerd als 'verlopen'.",
      },
    ],
  },
  tasks: {
    pageTitle: "Mijn Taken",
    intro: "Hier zie je alle taken die aan jou zijn toegewezen en nog niet zijn afgerond.",
    sections: [
      {
        title: "Taaktypen",
        body: "🧪 Stap uitvoeren – je moet een teststap handmatig testen en het resultaat vastleggen.\n🔄 Hertest – een opgeloste bevinding moet opnieuw worden getest.\n❓ Vraag beantwoorden – de functioneel beheerder wil dat je een bevinding beoordeelt of informatie aanlevert.",
      },
      {
        title: "Resultaat vastleggen",
        body: "Klik op een taak en kies 'Resultaat vastleggen'. Kies Geslaagd, Mislukt of Geblokkeerd. Voeg een omschrijving en notities toe (optioneel). Na het opslaan verdwijnt de taak uit je lijst.",
      },
      {
        title: "Bevinding melden",
        body: "Klik op 'Bevinding melden' om een fout, wens of blokkade te registreren. Geef een duidelijke titel, beschrijving, type en impact op. Je kunt meerdere bevindingen melden op dezelfde stap voordat je het resultaat vastlegt.",
      },
      {
        title: "Hertest beoordelen",
        body: "Bij een hertesttaak zie je de oorspronkelijke bevinding bovenaan. Voer de stap opnieuw uit en selecteer 'Hertest geslaagd' of 'Hertest mislukt'.",
      },
    ],
  },
  issues: {
    pageTitle: "Bevindingen",
    intro: "Hier zie je alle bevindingen (fouten, wensen, blokkades) die zijn gemeld binnen jouw projecten.",
    sections: [
      {
        title: "Statussen",
        body: "Nieuw → de bevinding is net aangemeld.\nIn behandeling → de functioneel beheerder pakt het op.\nVraag → er is extra informatie nodig.\nOpgelost → de leverancier heeft het opgelost; hertest volgt.\nAfgewezen → de bevinding is niet terecht of buiten scope.\nIngetrokken → de melder heeft de bevinding zelf teruggetrokken.",
      },
      {
        title: "Impact niveaus",
        body: "Kritiek – showstopper, blokkeert acceptatie.\nHoog – ernstige fout, maar er is een workaround.\nMiddel – merkbare fout, acceptabel voor go-live.\nLaag – cosmetisch of wens.",
      },
      {
        title: "Bevinding oplossen (FM)",
        body: "Klik op een bevinding en gebruik de knop 'Oplossen (hertest aanmaken)'. Dit stuurt automatisch een hertesttaak naar de testers van de betreffende stap.",
      },
      {
        title: "Filteren",
        body: "Gebruik de filterbalken bovenaan om te filteren op status, type of impact. Klik 'Filters wissen' om alle filters te verwijderen.",
      },
    ],
  },
  "my-issues": {
    pageTitle: "Mijn Bevindingen",
    intro: "Hier zie je alleen de bevindingen die jijzelf hebt gemeld, verdeeld over twee kolommen.",
    sections: [
      {
        title: "Actieve bevindingen",
        body: "De linkerkolom toont alle bevindingen die je hebt gemeld en die niet zijn ingetrokken.",
      },
      {
        title: "Ingetrokken bevindingen",
        body: "De rechterkolom toont bevindingen die je hebt ingetrokken. Je kunt ze aanpassen (titel, omschrijving, type, impact) en opnieuw indienen via de detailpagina.",
      },
      {
        title: "Bevinding intrekken",
        body: "Ga naar de detailpagina van een bevinding en klik 'Bevinding intrekken'. De actie wordt gelogd in het audit trail en de bevinding verschijnt in de rechterkolom.",
      },
    ],
  },
  projects: {
    pageTitle: "Projecten",
    intro: "Hier beheer je de testprojecten van jouw organisatie.",
    sections: [
      {
        title: "Nieuw project aanmaken",
        body: "Klik op '+ Nieuw project' en geef een naam, beschrijving en type (Implementatie, Optimalisatie of Release) op.",
      },
      {
        title: "Fases",
        body: "Een project is verdeeld in testfases: FAT (Functionele Acceptatietest), GAT (Gebruikers Acceptatietest) en PAT (Productie Acceptatietest). Elke fase bevat flows.",
      },
      {
        title: "Flows",
        body: "Een flow is een testproces met meerdere stappen. Je kunt een flow aanmaken op basis van een platformtemplate of zelf samenstellen.",
      },
    ],
  },
  flows: {
    pageTitle: "Flow beheer",
    intro: "Hier stel je de teststappen in voor een flow en wijs je testers toe.",
    sections: [
      {
        title: "Stappen beheren",
        body: "Voeg stappen toe met een titel, instructie en verwacht resultaat. Sleep stappen om de volgorde aan te passen.",
      },
      {
        title: "Testers toewijzen",
        body: "Wijs per stap een of meer testers toe. Als een stap meerdere testers heeft, kan elke tester onafhankelijk zijn resultaat vastleggen.",
      },
      {
        title: "Run starten",
        body: "Zodra een flow gereed is, kun je een 'Run' starten. Dit maakt testuitvoertaken aan voor alle aangewezen testers.",
      },
    ],
  },
  runs: {
    pageTitle: "Testrun uitvoeren",
    intro: "Dit is het uitvoerscherm voor een testrun. Stap voor stap worden de teststappen doorlopen.",
    sections: [
      {
        title: "Voortgang",
        body: "De voortgangsbalk bovenaan toont hoeveel stappen al zijn afgerond. Stappen worden sequentieel ontgrendeld: stap N+1 wordt pas actief als stap N klaar is.",
      },
      {
        title: "Resultaat invullen",
        body: "Per stap vul je het resultaat in (Geslaagd / Mislukt / Geblokkeerd) en kun je een beschrijving en notities toevoegen.",
      },
      {
        title: "Bevinding melden vanuit de run",
        body: "Via het run-scherm kun je ook bevindingen melden op een specifieke stap. Klik op 'Bevinding melden' onder de stap.",
      },
    ],
  },
  users: {
    pageTitle: "Gebruikers",
    intro: "Hier beheer je de gebruikers van jouw tenant.",
    sections: [
      {
        title: "Gebruiker toevoegen",
        body: "Klik op '+ Gebruiker toevoegen' en vul naam, e-mailadres, tijdelijk wachtwoord en rollen in.",
      },
      {
        title: "Rollen",
        body: "Beheerder – volledige toegang, kan alles instellen.\nScriptschrijver – kan flows en stappen aanmaken.\nTester – voert teststappen uit en meldt bevindingen.\nFunctioneel Beheerder – beoordeelt bevindingen, keurt goed of af.",
      },
      {
        title: "Gebruiker deactiveren",
        body: "Klik op 'Deactiveren' om een gebruiker tijdelijk uit te schakelen. Gedeactiveerde gebruikers kunnen niet meer inloggen maar hun data blijft bewaard.",
      },
      {
        title: "E-maildomein suggestie",
        body: "Zodra jouw organisatiedomein is ingesteld (via onboarding of instellingen), wordt dit automatisch voorgesteld bij het invoeren van een nieuw e-mailadres.",
      },
    ],
  },
  "go-live": {
    pageTitle: "Go-live Criteria",
    intro: "Stel hier per project de kwaliteitscriteria in die gelden op de go/no-go datum.",
    sections: [
      {
        title: "Go-live datum vs. Go/no-go datum",
        body: "De go-live datum is de geplande livegang. De go/no-go datum is het moment waarop wordt beoordeeld of de kwaliteitscriteria gehaald zijn. Dit is doorgaans 1-2 weken voor go-live.",
      },
      {
        title: "Maximum open bevindingen",
        body: "Stel per impactniveau het maximale aantal openstaande bevindingen in. Laat een veld leeg voor onbeperkt. Vul 0 in als er geen bevindingen van dat niveau open mogen staan.",
      },
      {
        title: "Real-time monitoring",
        body: "Onderaan de pagina zie je het actuele aantal openstaande bevindingen per impactniveau. Het systeem geeft een GO of NO-GO verdict op basis van de ingestelde limieten.",
      },
    ],
  },
  audit: {
    pageTitle: "Audit Trail",
    intro: "Hier zie je een volledige log van alle acties die zijn uitgevoerd in het systeem.",
    sections: [
      {
        title: "Wat wordt gelogd?",
        body: "Alle mutaties op bevindingen (aanmaken, bijwerken, intrekken, oplossen, afwijzen) en stap-resultaten worden vastgelegd met de naam van de gebruiker, het tijdstip en de voor/na-waarden.",
      },
      {
        title: "Filteren",
        body: "Filter op entiteittype (Bevinding of Teststap), actie, en datumbereik. Klik op 'Details' bij een logregel om de voor- en na-waarden te vergelijken.",
      },
      {
        title: "Compliance",
        body: "De audit trail is bedoeld voor compliance- en auditdoeleinden. Je kunt de gefilterde resultaten exporteren via je browser (Ctrl+P → PDF of screenprintfunctionaliteit).",
      },
    ],
  },
  reports: {
    pageTitle: "Rapportages",
    intro: "Genereer professionele PDF-rapportages voor stuurgroep en formele oplevering.",
    sections: [
      {
        title: "Voortgangsrapport",
        body: "Het voortgangsrapport is bedoeld als tussentijdse update voor de stuurgroep. Het bevat KPI-kaarten, testvoortgang per flow met visuele voortgangsbalk, openstaande bevindingen gesorteerd op impact, en de actuele go-live criteria status.",
      },
      {
        title: "Opleververslag",
        body: "Het opleververslag is de formele eindrapportage van een testfase. Het bevat alle testresultaten per stap (inclusief tester en datum), een volledige bevindingslog, go/no-go beoordeling met motivering, en een handtekeningpagina voor akkoord.",
      },
      {
        title: "Issue Log PDF",
        body: "De issue log is een compleet overzicht van alle bevindingen op projectniveau, gesorteerd op impact. Handig als bijlage bij de oplevertelling of voor interne audit.",
      },
      {
        title: "Branding",
        body: "Alle rapporten bevatten automatisch het logo en de organisatienaam zoals ingesteld bij onboarding of via de zijbalk. Zorg dat deze correct zijn ingesteld voordat je een rapport genereert.",
      },
    ],
  },
  settings: {
    pageTitle: "Instellingen",
    intro: "Hier kun je de organisatie-instellingen aanpassen die tijdens onboarding zijn ingevoerd.",
    sections: [
      {
        title: "Logo",
        body: "Upload een nieuw logo (PNG, JPG of SVG). Het logo wordt automatisch geschaald en getoond in de zijbalk en het dashboard.",
      },
      {
        title: "E-maildomein",
        body: "Het e-maildomein wordt gebruikt als suggestie bij het aanmaken van nieuwe gebruikers.",
      },
      {
        title: "Modules",
        body: "De geselecteerde modules geven aan welke AFAS-modules worden getest. Dit wordt ook gebruikt om relevante template flows te tonen.",
      },
    ],
  },
};
