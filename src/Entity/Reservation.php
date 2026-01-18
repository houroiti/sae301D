<?php

namespace App\Entity;

use App\Repository\ReservationRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ReservationRepository::class)]
class Reservation
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 100)]
    private ?string $nomClient = null;

    #[ORM\Column(length: 100)]
    private ?string $prenomClient = null;

    #[ORM\Column(length: 180)]
    private ?string $emailClient = null;

    #[ORM\Column(length: 50, nullable: true)]
    private ?string $telephoneClient = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $adresseClient = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $complementAdresse = null;

    #[ORM\Column(length: 100, nullable: true)]
    private ?string $villeClient = null;

    #[ORM\Column(length: 50, nullable: true)]
    private ?string $typeLogement = null;

    #[ORM\Column(nullable: true)]
    private ?int $etage = null;

    #[ORM\Column(type: 'boolean', options: ['default' => false])]
    private bool $ascenseur = false;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $infosAcces = null;

    #[ORM\Column(length: 100, nullable: true)]
    private ?string $parking = null;

    #[ORM\Column(type: 'decimal', precision: 10, scale: 7, nullable: true)]
    private ?float $lat = null;

    #[ORM\Column(type: 'decimal', precision: 10, scale: 7, nullable: true)]
    private ?float $lng = null;

    #[ORM\Column(length: 50)]
    private ?string $discipline = null;

    #[ORM\Column(length: 50)]
    private ?string $sessionType = null;

    #[ORM\Column(type: 'datetime')]
    private ?\DateTimeInterface $dateDebut = null;

    #[ORM\Column(type: 'datetime')]
    private ?\DateTimeInterface $dateFin = null;

    #[ORM\Column(type: 'integer')]
    private ?int $dureeMinutes = null;

    #[ORM\Column(length: 50, nullable: true)]
    private ?string $frequence = 'unique';

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $options = null;

    #[ORM\Column(type: 'decimal', precision: 8, scale: 2)]
    private ?float $prixSession = null;

    #[ORM\Column(type: 'decimal', precision: 8, scale: 2, options: ['default' => 0.00])]
    private ?float $prixOptions = 0.00;

    #[ORM\Column(type: 'decimal', precision: 8, scale: 2)]
    private ?float $total = null;

    #[ORM\Column(length: 50, options: ['default' => 'pending'])]
    private ?string $status = 'pending';

    #[ORM\Column(type: 'datetime')]
    private ?\DateTimeInterface $dateCreation = null;

    public function __construct()
    {
        $this->dateCreation = new \DateTimeImmutable();
        $this->ascenseur = false;
        $this->prixOptions = 0.00;
    }

    // --------------------------
    // GETTERS & SETTERS
    // --------------------------

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNomClient(): ?string
    {
        return $this->nomClient;
    }

    public function setNomClient(string $nomClient): static
    {
        $this->nomClient = $nomClient;
        return $this;
    }

    public function getPrenomClient(): ?string
    {
        return $this->prenomClient;
    }

    public function setPrenomClient(string $prenomClient): static
    {
        $this->prenomClient = $prenomClient;
        return $this;
    }

    public function getEmailClient(): ?string
    {
        return $this->emailClient;
    }

    public function setEmailClient(string $emailClient): static
    {
        $this->emailClient = $emailClient;
        return $this;
    }

    public function getTelephoneClient(): ?string
    {
        return $this->telephoneClient;
    }

    public function setTelephoneClient(?string $telephoneClient): static
    {
        $this->telephoneClient = $telephoneClient;
        return $this;
    }

    public function getAdresseClient(): ?string
    {
        return $this->adresseClient;
    }

    public function setAdresseClient(?string $adresseClient): static
    {
        $this->adresseClient = $adresseClient;
        return $this;
    }

    public function getComplementAdresse(): ?string
    {
        return $this->complementAdresse;
    }

    public function setComplementAdresse(?string $complementAdresse): static
    {
        $this->complementAdresse = $complementAdresse;
        return $this;
    }

    public function getVilleClient(): ?string
    {
        return $this->villeClient;
    }

    public function setVilleClient(?string $villeClient): static
    {
        $this->villeClient = $villeClient;
        return $this;
    }
    public function getAdresseCompleteClient(): ?string
    {
        $parts = [
            $this->adresseClient,
            $this->complementAdresse,
            $this->villeClient
        ];

        // Supprime les parties nulles
        $fullAddress = implode(', ', array_filter($parts, fn($p) => $p && trim($p) !== ''));

        return $fullAddress ?: null;
    }
    public function getTypeLogement(): ?string { return $this->typeLogement; }
    public function setTypeLogement(?string $typeLogement): static { $this->typeLogement = $typeLogement; return $this; }
    public function getEtage(): ?int { return $this->etage; }
    public function setEtage(?int $etage): static { $this->etage = $etage; return $this; }
    public function hasAscenseur(): bool { return $this->ascenseur; }
    public function setAscenseur(bool $ascenseur): static { $this->ascenseur = $ascenseur; return $this; }
    public function getInfosAcces(): ?string { return $this->infosAcces; }
    public function setInfosAcces(?string $infosAcces): static { $this->infosAcces = $infosAcces; return $this; }
    public function getParking(): ?string { return $this->parking; }
    public function setParking(?string $parking): static { $this->parking = $parking; return $this; }
    public function getLat(): ?float { return $this->lat; }
    public function setLat(?float $lat): static { $this->lat = $lat; return $this; }
    public function getLng(): ?float { return $this->lng; }
    public function setLng(?float $lng): static { $this->lng = $lng; return $this; }
    public function getDiscipline(): ?string { return $this->discipline; }
    public function setDiscipline(string $discipline): static { $this->discipline = $discipline; return $this; }
    public function getSessionType(): ?string { return $this->sessionType; }
    public function setSessionType(string $sessionType): static { $this->sessionType = $sessionType; return $this; }
    public function getDateDebut(): ?\DateTimeInterface { return $this->dateDebut; }
    public function setDateDebut(\DateTimeInterface $dateDebut): static { $this->dateDebut = $dateDebut; return $this; }
    public function getDateFin(): ?\DateTimeInterface { return $this->dateFin; }
    public function setDateFin(\DateTimeInterface $dateFin): static { $this->dateFin = $dateFin; return $this; }
    public function getDureeMinutes(): ?int { return $this->dureeMinutes; }
    public function setDureeMinutes(int $dureeMinutes): static { $this->dureeMinutes = $dureeMinutes; return $this; }
    public function getFrequence(): ?string { return $this->frequence; }
    public function setFrequence(?string $frequence): static { $this->frequence = $frequence; return $this; }
    public function getOptions(): ?string { return $this->options; }
    public function setOptions(?string $options): static { $this->options = $options; return $this; }
    public function getPrixSession(): ?float { return $this->prixSession; }
    public function setPrixSession(float $prixSession): static { $this->prixSession = $prixSession; return $this; }
    public function getPrixOptions(): ?float { return $this->prixOptions; }
    public function setPrixOptions(?float $prixOptions): static { $this->prixOptions = $prixOptions; return $this; }
    public function getTotal(): ?float { return $this->total; }
    public function setTotal(float $total): static { $this->total = $total; return $this; }
    public function getStatus(): ?string { return $this->status; }
    public function setStatus(string $status): static { $this->status = $status; return $this; }
    public function getDateCreation(): ?\DateTimeInterface { return $this->dateCreation; }
    public function setDateCreation(\DateTimeInterface $dateCreation): static { $this->dateCreation = $dateCreation; return $this; }
}
