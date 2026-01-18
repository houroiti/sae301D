<?php

namespace App\Entity;

use App\Repository\IndisponibiliteRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: IndisponibiliteRepository::class)]
class Indisponibilite
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(type: 'date')]
    private \DateTimeInterface $date;

    #[ORM\Column(type: 'string', length: 5)]
    private string $start;

    #[ORM\Column(type: 'string', length: 5)]
    private string $end;

    #[ORM\Column(type: 'string', length: 255)]
    private string $reason;

    // GETTERS / SETTERS
    public function getId(): ?int { return $this->id; }

    public function getDate(): \DateTimeInterface { return $this->date; }
    public function setDate(\DateTimeInterface $date): self { $this->date = $date; return $this; }

    public function getStart(): string { return $this->start; }
    public function setStart(string $start): self { $this->start = $start; return $this; }

    public function getEnd(): string { return $this->end; }
    public function setEnd(string $end): self { $this->end = $end; return $this; }

    public function getReason(): string { return $this->reason; }
    public function setReason(string $reason): self { $this->reason = $reason; return $this; }
}
