// Politique de confidentialite (Loi 25) - v1.0
// MODELE a faire valider par un conseiller juridique avant mise en marche commerciale.

export default function PolitiqueConfidentialite(p){
  var S={h:{fontSize:15,fontWeight:800,color:"#13233A",margin:"22px 0 8px"},p:{fontSize:12.5,color:"#3d3a33",lineHeight:1.7,margin:"0 0 10px"}};
  return(
    <div style={{minHeight:"100vh",background:"#F5F3EE",fontFamily:"Georgia,serif"}}>
      <div style={{background:"#13233A",padding:"14px 20px",display:"flex",alignItems:"center",gap:14}}>
        <button onClick={p.onRetour} style={{background:"#ffffff20",border:"1px solid #ffffff40",borderRadius:7,padding:"6px 14px",color:"#fff",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Retour</button>
        <span style={{fontSize:14,fontWeight:800,color:"#fff"}}>Politique de confidentialite</span>
      </div>
      <div style={{maxWidth:760,margin:"0 auto",padding:"28px 20px 60px"}}>
        <div style={{background:"#FFF",border:"1px solid #DDD9CF",borderRadius:12,padding:"28px 32px"}}>
          <div style={{fontSize:20,fontWeight:900,color:"#13233A"}}>Politique de confidentialite</div>
          <div style={{fontSize:11,color:"#7C7568",marginBottom:6}}>Predictek - Plateforme de gestion de copropriete | Derniere mise a jour: aout 2026</div>
          <div style={{background:"#FEF3E2",border:"1px solid #B8602044",borderRadius:8,padding:"8px 12px",fontSize:11,color:"#B86020",marginBottom:10}}>
            Version preliminaire - a faire valider par un conseiller juridique avant utilisation commerciale.
          </div>

          <div style={S.h}>1. Responsable de la protection des renseignements personnels</div>
          <p style={S.p}>Conformement a la Loi 25 (Loi modernisant des dispositions legislatives en matiere de protection des renseignements personnels), le responsable de la protection des renseignements personnels de Predictek est: <b>Jean-Francois Laroche</b>. Pour toute question ou demande relative a vos renseignements personnels: <b>jflaroche@cgocable.ca</b>.</p>

          <div style={S.h}>2. Renseignements que nous recueillons</div>
          <p style={S.p}>Dans le cadre de la gestion de votre copropriete, nous recueillons: identite et coordonnees des coproprietaires, administrateurs et locataires (nom, adresse, courriel, telephone); renseignements sur les unites (quotes-parts, cadastre, stationnement); renseignements financiers lies aux cotisations et paiements; documents officiels du syndicat (declaration de copropriete, proces-verbaux, contrats); et, pour les administrateurs remuneres, le numero d assurance sociale (NAS) requis pour les feuillets fiscaux.</p>

          <div style={S.h}>3. Finalites et consentement</div>
          <p style={S.p}>Ces renseignements sont utilises exclusivement pour la gestion de la copropriete: perception des cotisations, communications officielles, tenue des registres exiges par la loi, production des documents fiscaux et administration courante. Ils ne sont ni vendus ni communiques a des tiers a des fins commerciales.</p>

          <div style={S.h}>4. Mesures de securite</div>
          <p style={S.p}>Acces protege par authentification individuelle avec mots de passe verifies; permissions par role limitant chaque utilisateur aux donnees de son syndicat; NAS chiffres (AES-256-GCM) et jamais affiches en clair; communications chiffrees (HTTPS); journalisation des actions dans un historique.</p>

          <div style={S.h}>5. Hebergement des donnees</div>
          <p style={S.p}>Les donnees sont hebergees sur des serveurs infonuagiques situes aux Etats-Unis (fournisseurs Vercel et Supabase). En utilisant la plateforme, vous consentez a ce que vos renseignements soient conserves hors du Quebec, avec des protections contractuelles et techniques equivalentes.</p>

          <div style={S.h}>6. Conservation et destruction</div>
          <p style={S.p}>Les renseignements sont conserves pendant la duree requise par la gestion de la copropriete et les obligations legales du syndicat, puis detruits ou anonymises de facon securitaire.</p>

          <div style={S.h}>7. Vos droits</div>
          <p style={S.p}>Vous pouvez demander l acces a vos renseignements personnels, leur rectification s ils sont inexacts, ou le retrait de votre consentement lorsque la loi le permet. Adressez votre demande au responsable identifie a la section 1; une reponse vous sera transmise dans les 30 jours.</p>

          <div style={S.h}>8. Incidents de confidentialite</div>
          <p style={S.p}>Tout incident impliquant vos renseignements personnels est consigne dans un registre des incidents. Si un incident presente un risque de prejudice serieux, les personnes concernees et la Commission d acces a l information du Quebec en sont avisees, conformement a la loi.</p>
        </div>
      </div>
    </div>
  );
}
